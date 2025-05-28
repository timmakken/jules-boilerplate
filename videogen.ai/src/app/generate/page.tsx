'use client';

import { useState, ChangeEvent, FormEvent } from 'react'; // Added FormEvent

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

const handleGenerate = async () => {
  if (!prompt.trim()) { // Simplified validation
    setError("Please fill in the prompt.");
    return;
  }

  setIsLoading(true);
  setError(null);
  setGeneratedVideoUrl(null); // This will now store an image URL
  setProgress(5);

  const payload = {
    prompt: prompt,
    // Example: you might need to pass specific parameters your ComfyUI workflow expects
    // "width": 512,
    // "height": 512,
    // "seed": Math.floor(Math.random() * 1000000), // Example seed
    // "client_id": "your_client_id_here" // If comfy-pack requires it
  };

  let currentProgress = 5;
  const progressInterval = setInterval(() => {
    currentProgress += 5;
    if (currentProgress <= 95) {
      setProgress(currentProgress);
    } else {
      clearInterval(progressInterval);
    }
  }, 300);

  try {
    const response = await fetch('/api/comfyui', { // Changed endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Sending JSON
        'Accept': 'application/octet-stream', // Expecting an image
      },
      body: JSON.stringify(payload), // Send JSON payload
    });

    clearInterval(progressInterval);

    if (!response.ok) {
      let backendError = `Error: ${response.status} ${response.statusText}`;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
          const errorData = await response.json();
          backendError = errorData.message || errorData.error || backendError;
        } catch (e) {
          // Stick with statusText if parsing JSON error fails
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) backendError = textError;
        } catch (e) {
          // Stick with statusText if getting text error fails
        }
      }
      throw new Error(backendError);
    }

    const responseContentType = response.headers.get('Content-Type');
    if (responseContentType && (responseContentType.includes('application/octet-stream') || responseContentType.startsWith('image/'))) {
      const imageBlob = await response.blob();
      if (imageBlob.size === 0) {
        throw new Error('Received empty image data from the server.');
      }
      setGeneratedVideoUrl(URL.createObjectURL(imageBlob)); // Store object URL for image display
      setProgress(100);
    } else {
      // If the response is OK but not an image stream, it might be an unexpected JSON success message
      // or some other format. This indicates a mismatch in expectations.
      const unexpectedResponse = await response.text();
      console.error('Unexpected response type:', responseContentType, 'Content:', unexpectedResponse);
      throw new Error(`Expected an image stream, but received ${responseContentType || 'unknown content type'}.`);
    }

  } catch (err: any) {
    setError(err.message || 'An unexpected error occurred during image generation.');
    setProgress(0); // Reset progress on error
  } finally {
    clearInterval(progressInterval); // Ensure interval is always cleared
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-400">Create Your AI Video</h1>
          <p className="text-xl text-gray-300 mt-2">
            Bring your ideas to life with our intelligent video generation tool.
          </p>
        </header>

        <section id="upload-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">1. Upload Your Media (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Image</label>
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
              <label htmlFor="video-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Video</label>
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
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">2. Describe Your Vision</h2>
          <div>
            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-1">Your Prompt <span className="text-red-500">*</span></label>
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
                disabled={isLoading}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Target Platform...</option>
                <option value="youtube_16_9">YouTube (16:9)</option>
                <option value="tiktok_9_16">TikTok (9:16)</option>
                <option value="instagram_1_1">Instagram Post (1:1)</option>
                <option value="instagram_9_16">Instagram Story (9:16)</option>
                <option value="linkedin">LinkedIn Feed</option>
              </select>
            </div>
          </div>
        </section>

        <section id="generate-action-section" className="mb-8 text-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full md:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? `Generating... (${progress}%)` : 'Generate Video'}
          </button>
        </section>
        
        {error && (
          <section id="error-message-section" className="mb-8 p-4 bg-red-700 rounded-lg shadow-md text-center">
            <p className="text-white font-medium">{error}</p>
          </section>
        )}

        {isLoading && (
          <section id="progress-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold text-blue-300 mb-4 text-center">Generating your video...</h2>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-linear" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-400 mt-2">{progress > 0 ? `${progress}% complete` : "Initializing..."}</p>
          </section>
        )}

        {generatedVideoUrl && !isLoading && (
          <section id="image-preview-section" className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl"> {/* id updated for clarity */}
            <h2 className="text-2xl font-semibold text-blue-300 mb-4 text-center">Your Image is Ready!</h2>
            <div className="bg-black rounded-md overflow-hidden flex justify-center items-center"> {/* Adjusted div for image centering if needed */}
              <img 
                src={generatedVideoUrl} 
                alt="Generated Image" 
                className="max-w-full max-h-[70vh] object-contain" // Adjusted styling for typical image display
              />
            </div>
            <div className="text-center mt-6">
              <a
                href={generatedVideoUrl}
                download="generated_image.png" // Changed download filename
                className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
              >
                Download Image 
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
