'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'; // Added React and useEffect

// Define allowed file types and sizes
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo']; // .mov, .avi
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

interface FileErrors {
  image?: string;
  video?: string;
}

export default function GenerateVideoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [artStyle, setArtStyle] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<FileErrors>({});
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // Example: 0-100

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!IMAGE_TYPES.includes(file.type)) {
        setFileErrors(prev => ({ ...prev, image: 'Invalid file type. Please use JPG, PNG, or GIF.' }));
        setImageFile(null); event.target.value = ''; // Reset input
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setFileErrors(prev => ({ ...prev, image: `File is too large. Max ${MAX_IMAGE_SIZE / (1024*1024)}MB.` }));
        setImageFile(null); event.target.value = ''; // Reset input
        return;
      }
      setImageFile(file);
      setFileErrors(prev => ({ ...prev, image: undefined }));
    } else {
      setImageFile(null);
      setFileErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // MIME type for .avi can be video/x-msvideo or video/avi.
      // .mov is video/quicktime
      const acceptedVideoTypes = [...VIDEO_TYPES, 'video/avi'];
      if (!acceptedVideoTypes.includes(file.type)) {
        setFileErrors(prev => ({ ...prev, video: 'Invalid file type. Please use MP4, MOV, or AVI.' }));
        setVideoFile(null); event.target.value = ''; // Reset input
        return;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        setFileErrors(prev => ({ ...prev, video: `File is too large. Max ${MAX_VIDEO_SIZE / (1024*1024)}MB.` }));
        setVideoFile(null); event.target.value = ''; // Reset input
        return;
      }
      setVideoFile(file);
      setFileErrors(prev => ({ ...prev, video: undefined }));
    } else {
      setVideoFile(null);
      setFileErrors(prev => ({ ...prev, video: undefined }));
    }
  };

// Add a state for the job ID
const [jobId, setJobId] = useState<string | null>(null);
// Add a state for polling interval
const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
// Add states for retry logic
const [retryCount, setRetryCount] = useState<number>(0);
const [lastRetryTime, setLastRetryTime] = useState<number>(0);
const [isManualRefreshAvailable, setIsManualRefreshAvailable] = useState<boolean>(false);

const handleGenerate = async () => {
  // Updated validation
  if (!prompt.trim() || !imageFile || !videoFile) {
    setError("Please fill in the prompt and upload both a reference image and a video.");
    return;
  }
  // Clear file-specific errors if general validation passes for these
  if (fileErrors.image && !imageFile) { /* keep error */ } else if (fileErrors.image) { setFileErrors(prev => ({...prev, image: undefined}));}
  if (fileErrors.video && !videoFile) { /* keep error */ } else if (fileErrors.video) { setFileErrors(prev => ({...prev, video: undefined}));}

  // Reset states
  setIsLoading(true);
  setError(null);
  setGeneratedVideoUrl(null); 
  setProgress(5);
  setJobId(null);
  
  // Clear any existing polling interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
    setPollingInterval(null);
  }

  const formData = new FormData();

  let finalPrompt = prompt;
  if (artStyle) {
    finalPrompt = `Art Style: ${artStyle}. User Prompt: ${prompt}`;
  }
  formData.append('Prompt', finalPrompt); // Field name from OpenAPI spec - send as plain string, not JSON

  if (imageFile) { // Should always be true due to validation
    formData.append('reference_image', imageFile); // Field name from OpenAPI spec
  }
  if (videoFile) { // Should always be true due to validation
    formData.append('video', videoFile); // Field name from OpenAPI spec
  }
  
  // Set up a progress indicator for the async process
  let currentProgress = 5;
  const progressInterval = setInterval(() => {
    // Slower increment for longer processes
    const increment = currentProgress < 50 ? 1 : 0.2; // Slow down as we progress
    currentProgress += increment;
    
    // Cap at 95% until we get actual completion
    if (currentProgress <= 95) {
      setProgress(Math.min(Math.round(currentProgress), 95));
    } else {
      clearInterval(progressInterval);
    }
  }, 5000); // Update every 5 seconds

  try {
    // Step 1: Submit the job and get a job ID
    const response = await fetch('/api/comfyui', {
      method: 'POST',
      // Content-Type is set automatically by browser for FormData
      headers: {
        'Accept': 'application/json', // We expect a JSON response with job ID
      },
      body: formData,
    });

    if (!response.ok) {
      clearInterval(progressInterval);
      let backendError = `Error: ${response.status} ${response.statusText}`;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
          const errorData = await response.json();
          backendError = errorData.message || errorData.error || backendError;
        } catch (e) { /* Stick with statusText */ }
      } else {
        try {
          const textError = await response.text();
          if (textError) backendError = textError;
        } catch (e) { /* Stick with statusText */ }
      }
      throw new Error(backendError);
    }

    // Parse the response to get the job ID
    const jobData = await response.json();
    const newJobId = jobData.jobId;
    
    if (!newJobId) {
      clearInterval(progressInterval);
      throw new Error('No job ID returned from the server.');
    }
    
    setJobId(newJobId);
    console.log(`Job submitted with ID: ${newJobId}`);
    
    // Step 2: Start polling for job status
    const statusInterval = setInterval(async () => {
      try {
        await checkJobStatus(newJobId);
  } catch (error) {
    console.error('Error checking job status:', error);
    
    // Check if it's an AbortError (timeout)
    if (error instanceof Error) {
      console.log(`Error type: ${error.name}`);
      
      if (error.name === 'AbortError') {
        console.log('Status check timed out');
        
        // Increment retry count
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        // Calculate backoff time (exponential with max cap)
        const backoffTime = Math.min(5000 * Math.pow(2, newRetryCount), 60000);
        console.log(`Will retry in ${backoffTime/1000} seconds`);
        
        // Record the retry time
        const now = Date.now();
        setLastRetryTime(now);
        
        // After a few retries, show manual refresh option
        if (newRetryCount >= 3) {
          setIsManualRefreshAvailable(true);
        }
        
        // Schedule a single retry with backoff
        setTimeout(() => {
          // Only proceed if we're still loading and haven't been cancelled
          if (isLoading && jobId) {
            checkJobStatus(jobId);
          }
        }, backoffTime);
        
        // Don't continue with regular polling this time
        return;
      }
    }
    
    // For other errors, continue with regular polling
  }
    }, 5000); // Check every 5 seconds
    
    setPollingInterval(statusInterval);

  } catch (err: any) {
    clearInterval(progressInterval);
    setError(err.message || 'An unexpected error occurred during job submission.');
    setProgress(0);
    setIsLoading(false);
  }
};

// Function to manually refresh the status
const handleManualRefresh = () => {
  if (jobId) {
    // Reset the retry count
    setRetryCount(0);
    // Hide the manual refresh button
    setIsManualRefreshAvailable(false);
    // Check the status manually
    checkJobStatus(jobId, true);
  }
};

// Function to check job status with improved timeout handling
const checkJobStatus = async (jobId: string, isManualCheck = false) => {
  try {
    // Create an AbortController with a longer timeout (2 minutes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes
    
    console.log(`Checking status for job ${jobId}${isManualCheck ? ' (manual check)' : ''}`);
    
    const statusResponse = await fetch(`/api/comfyui/status/${jobId}`, {
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Reset retry count on successful fetch
    if (retryCount > 0) {
      setRetryCount(0);
    }
    
    // Hide manual refresh button on successful fetch
    if (isManualRefreshAvailable) {
      setIsManualRefreshAvailable(false);
    }
    
    if (!statusResponse.ok) {
      console.error(`Status check failed: ${statusResponse.status} ${statusResponse.statusText}`);
      
      // If we get a 500 error, it might be because the job failed or there was an error processing the result
      if (statusResponse.status === 500) {
        try {
          // Try to parse the error response
          const errorData = await statusResponse.json();
          console.error('Error data:', errorData);
          
          // If this is a job failure (not a server error), stop polling and show the error
          if (errorData.status === 'failed' || errorData.error) {
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
            setIsLoading(false);
            setProgress(0);
            setError(errorData.error || 'The generation process failed.');
          }
        } catch (e) {
          // If we can't parse the error as JSON, just log it and continue polling
          console.error('Failed to parse error response:', e);
        }
      }
      
      // For other error codes, continue polling
      return;
    }
    
    // Check the content type to determine if this is a status update or the final result
    const responseContentType = statusResponse.headers.get('Content-Type');
    
    if (responseContentType && responseContentType.includes('application/json')) {
      // This is a status update
      const statusData = await statusResponse.json();
      console.log('Job status:', statusData);
      
      if (statusData.status === 'failed') {
        // Job failed, stop polling and show error
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setIsLoading(false);
        setProgress(0);
        setError(statusData.error || 'The generation process failed.');
      }
      
      // If still processing, continue polling
      return;
    }
    
    // If we get here, the content type is not JSON, which means we have the result
    const blobData = await statusResponse.blob();
    
    if (blobData.size === 0) {
      console.error('Received empty data from the server.');
      return; // Continue polling
    }
    
    // We have the result, stop polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // Save the content type and set the result
    setContentType(responseContentType);
    setGeneratedVideoUrl(URL.createObjectURL(blobData));
    setProgress(100);
    setIsLoading(false);
    
    console.log(`Received result with content type: ${responseContentType}`);
    
  } catch (error) {
    console.error('Error checking job status:', error);
    
    // Check if it's an AbortError (timeout)
    if (error instanceof Error) {
      console.log(`Error type: ${error.name}`);
      
      if (error.name === 'AbortError') {
        console.log('Status check timed out');
        
        // Increment retry count
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        // Calculate backoff time (exponential with max cap)
        const backoffTime = Math.min(5000 * Math.pow(2, newRetryCount), 60000);
        console.log(`Will retry in ${backoffTime/1000} seconds`);
        
        // Record the retry time
        const now = Date.now();
        setLastRetryTime(now);
        
        // After a few retries, show manual refresh option
        if (newRetryCount >= 3) {
          setIsManualRefreshAvailable(true);
        }
        
        // Schedule a single retry with backoff
        setTimeout(() => {
          // Only proceed if we're still loading and haven't been cancelled
          if (isLoading && jobId) {
            checkJobStatus(jobId);
          }
        }, backoffTime);
        
        // Don't continue with regular polling this time
        return;
      }
    }
    
    // For other errors, continue with regular polling
  }
};

// Clean up polling interval on component unmount
useEffect(() => {
  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };
}, [pollingInterval]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-400">AI Video/Image Generation</h1>
          <p className="text-xl text-gray-300 mt-2">
            Upload a reference image and video, then describe your vision to generate new content.
          </p>
        </header>

        <section id="upload-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">1. Upload Your Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-1">Reference Image <span className="text-red-500">*</span></label>
              <input 
                type="file" 
                id="image-upload" 
                name="image-upload" 
                accept="image/jpeg,image/png,image/gif" 
                onChange={handleImageChange}
                disabled={isLoading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Accepted: JPG, PNG, GIF. Max 5MB.</p>
              {fileErrors.image && <p className="text-xs text-red-500 mt-1">{fileErrors.image}</p>}
            </div>
            <div>
              <label htmlFor="video-upload" className="block text-sm font-medium text-gray-300 mb-1">Input Video <span className="text-red-500">*</span></label>
              <input 
                type="file" 
                id="video-upload" 
                name="video-upload" 
                accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
                onChange={handleVideoChange}
                disabled={isLoading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Accepted: MP4, MOV, AVI. Max 50MB.</p>
              {fileErrors.video && <p className="text-xs text-red-500 mt-1">{fileErrors.video}</p>}
            </div>
          </div>
        </section>

        <section id="prompt-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">2. Describe Your Vision (Prompt)</h2>
          <div>
            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-1">User Prompt <span className="text-red-500">*</span></label>
            <textarea 
              id="prompt-input" 
              name="prompt-input" 
              rows={4} 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" 
              placeholder="e.g., A futuristic city skyline at sunset, cinematic style..."
            />
          </div>
        </section>

        <section id="selectors-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">3. Choose Your Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="art-style-select" className="block text-sm font-medium text-gray-300 mb-1">Art Style <span className="text-red-500">*</span></label>
              <select 
                id="art-style-select" 
                name="art-style-select" 
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                disabled={isLoading}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Art Style...</option>
                <option value="cinematic">Cinematic</option>
                <option value="anime">Anime</option>
                <option value="fantasy">Fantasy</option>
                <option value="neon_punk">Neon Punk</option>
                <option value="abstract">Abstract</option>
              </select>
            </div>
            <div>
              <label htmlFor="target-platform-select" className="block text-sm font-medium text-gray-300 mb-1">Target Platform <span className="text-red-500">*</span></label>
              <select 
                id="target-platform-select" 
                name="target-platform-select" 
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                disabled={true}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Not Applicable</option>
                {/* <option value="youtube_16_9">YouTube (16:9)</option>
                <option value="tiktok_9_16">TikTok (9:16)</option>
                <option value="instagram_1_1">Instagram Post (1:1)</option>
                <option value="instagram_9_16">Instagram Story (9:16)</option>
                <option value="linkedin">LinkedIn Feed</option> */}
              </select>
              <p className="text-xs text-gray-500 mt-1">Target Platform selection is currently disabled.</p>
            </div>
          </div>
        </section>

        <section id="generate-action-section" className="mb-8 text-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || !imageFile || !videoFile || !!fileErrors.image || !!fileErrors.video}
            className="w-full md:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? `Generating... (${progress}%)` : 'Generate Content'}
          </button>
        </section>
        
        {error && (
          <section id="error-message-section" className="mb-8 p-4 bg-red-700 rounded-lg shadow-md text-center">
            <p className="text-white font-medium">{error}</p>
          </section>
        )}

        {isLoading && (
          <section id="progress-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold text-blue-300 mb-4 text-center">Generating your content...</h2>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-linear" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-400 mt-2">{progress > 0 ? `${progress}% complete` : "Initializing..."}</p>
            <p className="text-center text-gray-400 mt-4 text-sm">
              This process may take up to 20 minutes to complete. Please be patient.
            </p>
            
            {isManualRefreshAvailable && (
              <div className="mt-6 text-center">
                <p className="text-amber-400 mb-2">Status check timed out. The process may still be running.</p>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-gray-800"
                >
                  Check Status Manually
                </button>
              </div>
            )}
          </section>
        )}

        {generatedVideoUrl && !isLoading && (
          <section id="result-preview-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl"> 
            <h2 className="text-2xl font-semibold text-blue-300 mb-4 text-center">Your Generated Content is Ready!</h2>
            <div className="bg-black rounded-md overflow-hidden flex justify-center items-center"> 
              {/* Display image or video based on content type */}
              {contentType?.startsWith('image/') ? (
                <img 
                  src={generatedVideoUrl} 
                  alt="Generated Output"
                  className="max-w-full max-h-[70vh] object-contain" 
                />
              ) : contentType?.startsWith('video/') ? (
                <video 
                  src={generatedVideoUrl} 
                  controls
                  className="max-w-full max-h-[70vh]"
                />
              ) : (
                <div className="text-white p-4">
                  Content generated. <a href={generatedVideoUrl} className="text-blue-400 underline">Click to view</a>
                </div>
              )}
            </div>
            <div className="text-center mt-6">
              <a
                href={generatedVideoUrl}
                download={`generated_content.${contentType?.split('/')[1] || 'bin'}`}
                className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
              >
                Download Output
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
