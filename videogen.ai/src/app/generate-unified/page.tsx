'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';

const IMAGE_TYPES_ITV = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE_ITV = 5 * 1024 * 1024; // 5MB
const VIDEO_TYPES_VTV = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
const MAX_VIDEO_SIZE_VTV = 50 * 1024 * 1024; // 50MB
const STYLE_SOURCE_TYPES_VTV = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']; // Style can be image or video
const MAX_STYLE_SOURCE_SIZE_VTV = 20 * 1024 * 1024; // 20MB for style reference

export default function GenerateUnifiedPage() {
  const [generationMode, setGenerationMode] = useState<string>('text-to-video'); // Default mode
  const [prompt, setPrompt] = useState<string>('');
  const [artStyle, setArtStyle] = useState<string>('');
  const [imageFileITV, setImageFileITV] = useState<File | null>(null);
  const [imageErrorITV, setImageErrorITV] = useState<string | undefined>(undefined);
  const [contentVideoFileVTV, setContentVideoFileVTV] = useState<File | null>(null);
  const [contentVideoErrorVTV, setContentVideoErrorVTV] = useState<string | undefined>(undefined);
  const [styleSourceFileVTV, setStyleSourceFileVTV] = useState<File | null>(null);
  const [styleSourceErrorVTV, setStyleSourceErrorVTV] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null); // To store the type of the generated content
  const [progress, setProgress] = useState<number>(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isManualRefreshAvailable, setIsManualRefreshAvailable] = useState<boolean>(false);

  const handleImageChangeITV = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!IMAGE_TYPES_ITV.includes(file.type)) {
        setImageErrorITV('Invalid file type. Please use JPG, PNG, or GIF.');
        setImageFileITV(null);
        event.target.value = ''; // Reset input
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_ITV) {
        setImageErrorITV(`File is too large. Max ${MAX_IMAGE_SIZE_ITV / (1024 * 1024)}MB.`);
        setImageFileITV(null);
        event.target.value = ''; // Reset input
        return;
      }
      setImageFileITV(file);
      setImageErrorITV(undefined);
    } else {
      setImageFileITV(null);
      setImageErrorITV(undefined);
    }
  };

  const handleContentVideoChangeVTV = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const acceptedVideoTypes = [...VIDEO_TYPES_VTV];
      if (!acceptedVideoTypes.includes(file.type)) {
        setContentVideoErrorVTV('Invalid file type. Please use MP4, MOV, or AVI.');
        setContentVideoFileVTV(null); event.target.value = '';
        return;
      }
      if (file.size > MAX_VIDEO_SIZE_VTV) {
        setContentVideoErrorVTV(`File is too large. Max ${MAX_VIDEO_SIZE_VTV / (1024 * 1024)}MB.`);
        setContentVideoFileVTV(null); event.target.value = '';
        return;
      }
      setContentVideoFileVTV(file);
      setContentVideoErrorVTV(undefined);
    } else {
      setContentVideoFileVTV(null);
      setContentVideoErrorVTV(undefined);
    }
  };

  const handleStyleSourceChangeVTV = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!STYLE_SOURCE_TYPES_VTV.includes(file.type)) {
        setStyleSourceErrorVTV('Invalid file type. Use JPG, PNG, GIF, MP4, or MOV for style.');
        setStyleSourceFileVTV(null); event.target.value = '';
        return;
      }
      if (file.size > MAX_STYLE_SOURCE_SIZE_VTV) {
        setStyleSourceErrorVTV(`Style file is too large. Max ${MAX_STYLE_SOURCE_SIZE_VTV / (1024 * 1024)}MB.`);
        setStyleSourceFileVTV(null); event.target.value = '';
        return;
      }
      setStyleSourceFileVTV(file);
      setStyleSourceErrorVTV(undefined);
    } else {
      setStyleSourceFileVTV(null);
      setStyleSourceErrorVTV(undefined);
    }
  };

  const handleGenerate = async () => {
    // Clear previous general errors and mode-specific file errors
    setError(null);
    if (generationMode === 'image-to-video') setImageErrorITV(undefined);
    if (generationMode === 'video-to-video') {
      setContentVideoErrorVTV(undefined);
      setStyleSourceErrorVTV(undefined);
    }

    // 1. Validation
    if (generationMode === 'text-to-video') {
      if (!prompt.trim()) {
        setError("Please fill in the prompt for Text-to-Video.");
        return;
      }
    } else if (generationMode === 'image-to-video') {
      if (!imageFileITV) {
        setError("Please upload a reference image for Image-to-Video.");
        if (!imageErrorITV) setImageErrorITV("Reference image is required.");
        return;
      }
    } else if (generationMode === 'video-to-video') {
      if (!contentVideoFileVTV) {
        setError("Please upload a content video for Video-to-Video style transfer.");
        if (!contentVideoErrorVTV) setContentVideoErrorVTV("Content video is required.");
        return;
      }
      if (!styleSourceFileVTV) {
        setError("Please upload a style source (image or video) for Video-to-Video style transfer.");
        if (!styleSourceErrorVTV) setStyleSourceErrorVTV("Style source is required.");
        return;
      }
    }

    setIsLoading(true);
    setGeneratedVideoUrl(null);
    setContentType(null);
    setProgress(5); // Initial progress
    setJobId(null); // Reset job ID
    setRetryCount(0);
    setIsManualRefreshAvailable(false);

    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    const formData = new FormData();
    let finalPrompt = prompt;
    if (artStyle && artStyle.trim() !== "") {
      finalPrompt = `Art Style: ${artStyle}. User Prompt: ${prompt}`;
    }
    formData.append('Prompt', finalPrompt);
    formData.append('generationMode', generationMode);

    if (generationMode === 'image-to-video' && imageFileITV) {
      formData.append('reference_image', imageFileITV);
    } else if (generationMode === 'video-to-video') {
      if (contentVideoFileVTV) {
        formData.append('video', contentVideoFileVTV);
      }
      if (styleSourceFileVTV) {
        formData.append('style_source_file', styleSourceFileVTV);
      }
    }

    let currentProgress = 5;
    const progressInterval = setInterval(() => {
      currentProgress += 2;
      if (currentProgress >= 95) { // Stop before 100, as polling will take over
        clearInterval(progressInterval);
      } else {
        setProgress(currentProgress);
      }
    }, 5000); // Slower progress update

    try {
      const response = await fetch('/api/comfyui', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval); // Stop simulated progress

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during generation.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.jobId) {
        setJobId(result.jobId);
        setProgress(95); // Indicate that polling has started
        const newPollingInterval = setInterval(() => {
          checkJobStatus(result.jobId);
        }, 5000); // Check status every 5 seconds
        setPollingInterval(newPollingInterval);
      } else {
        throw new Error('Job ID not found in response.');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to start generation.');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const checkJobStatus = async (currentJobId: string, isManualCheck = false) => {
    if (!currentJobId) return;
    if (!isManualCheck) { // Only show "Checking..." if it's an auto poll
      // Consider if a visual "checking status..." is needed here or if progress bar at 95% is enough
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout for status check

    try {
      const response = await fetch(`/api/comfyui/status/${currentJobId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        // If the server explicitly says the job failed or is not found with an error status
        if (response.status === 404 || response.status === 500) {
            const errorData = await response.json().catch(() => ({ message: "Job status check failed or job not found."}));
            setError(errorData.message || `Error checking status: ${response.status}`);
            if (pollingInterval) clearInterval(pollingInterval);
            setPollingInterval(null);
            setIsLoading(false);
            setProgress(0); // Reset progress
            setIsManualRefreshAvailable(true); // Allow manual retry
            return;
        }
        // For other non-ok responses, treat as a retryable error for now
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentTypeHeader = response.headers.get('Content-Type');

      if (contentTypeHeader?.includes('application/json')) {
        const statusData = await response.json();
        setProgress(statusData.progress || 95); // Update progress from backend if available
        setRetryCount(0); // Reset retry count on successful status check

        if (statusData.status === 'completed' && statusData.fileUrl) {
          if (pollingInterval) clearInterval(pollingInterval);
          setPollingInterval(null);
          setGeneratedVideoUrl(statusData.fileUrl);
          setContentType(statusData.contentType || 'application/octet-stream');
          setIsLoading(false);
          setProgress(100);
          setIsManualRefreshAvailable(false);
        } else if (statusData.status === 'failed') {
          if (pollingInterval) clearInterval(pollingInterval);
          setPollingInterval(null);
          setError(statusData.error || 'Generation failed.');
          setIsLoading(false);
          setProgress(0);
          setIsManualRefreshAvailable(true);
        } else if (statusData.status === 'processing' || statusData.status === 'pending') {
          // Continue polling, it's still working
          setIsManualRefreshAvailable(false); // It's actively polling, hide manual
        }
      } else if (contentTypeHeader?.startsWith('video/') || contentTypeHeader?.startsWith('image/')) {
        // Direct file response (if backend sends file directly on status check for completed job)
        if (pollingInterval) clearInterval(pollingInterval);
        setPollingInterval(null);
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
        setContentType(contentTypeHeader);
        setIsLoading(false);
        setProgress(100);
        setRetryCount(0);
        setIsManualRefreshAvailable(false);
      } else {
        // Unexpected content type
        throw new Error('Unexpected content type received from status check.');
      }

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Status check timed out. Retrying...');
        setRetryCount(prev => prev + 1);
        if (retryCount + 1 >= 5) { // Max retries
          if (pollingInterval) clearInterval(pollingInterval);
          setPollingInterval(null);
          setError('Status check failed after multiple retries. Please try refreshing manually.');
          setIsLoading(false); // Stop loading indicator
          setIsManualRefreshAvailable(true); // Allow manual refresh
        }
        // Exponential backoff could be added here if desired for retries within polling interval
      } else {
        setError(`Error checking job status: ${err.message}`);
        if (pollingInterval) clearInterval(pollingInterval);
        setPollingInterval(null);
        setIsLoading(false);
        setProgress(0);
        setIsManualRefreshAvailable(true); // Allow manual refresh on other errors too
      }
    } finally {
        if (isManualCheck) setIsLoading(false); // Ensure loading is false after manual check
    }
  };

  const handleManualRefresh = () => {
    if (jobId) {
      setIsLoading(true); // Show loading while manually refreshing
      setError(null); // Clear previous errors
      setRetryCount(0); // Reset retry count for manual refresh attempt
      setIsManualRefreshAvailable(false); // Disable button during refresh
      checkJobStatus(jobId, true);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Unified Generation Hub
          </h1>
          <p className="text-xl text-gray-300 mt-3">
            Create stunning videos from text, images, or by transforming other videos. Choose your mode below.
          </p>
        </header>

        {/* Mode Selector UI */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-8">
            Choose Your Creative Path
          </h2>
          <div className="flex justify-center bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl shadow-xl border border-gray-700/50 max-w-2xl mx-auto">
            {['text-to-video', 'image-to-video', 'video-to-video'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGenerationMode(mode)}
                className={`w-1/3 py-4 px-2 text-center font-medium text-sm sm:text-base rounded-lg transition-all duration-300 ease-in-out focus:outline-none
                            ${generationMode === mode
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl scale-105 ring-2 ring-sky-400/70'
                              : 'bg-transparent text-gray-400 hover:text-sky-300 hover:bg-gray-700/50'}`}
              >
                {mode === 'text-to-video' && 'Text to Video'}
                {mode === 'image-to-video' && 'Image to Video'}
                {mode === 'video-to-video' && 'Video to Video'}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Rendering of Forms based on mode will go here */}
        <div>
          {generationMode === 'text-to-video' && (
            /* Text-to-Video Form */
            <div className="p-8 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-8 text-center">
                Describe Your Video Scene
              </h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="prompt-input-ttv" className="block text-sm font-medium text-gray-300 mb-1">
                    Prompt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="prompt-input-ttv"
                    name="prompt-input-ttv"
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    // disabled={isLoading} // Assuming isLoading state will be added later
                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-700 bg-gray-700/50 rounded-md text-white p-2.5 placeholder-gray-500"
                    placeholder="e.g., A majestic dragon flying over a fantasy kingdom, cinematic lighting..."
                  />
                </div>
                <div>
                  <label htmlFor="art-style-select-ttv" className="block text-sm font-medium text-gray-300 mb-1">
                    Art Style
                  </label>
                  <select
                    id="art-style-select-ttv"
                    name="art-style-select-ttv"
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    // disabled={isLoading} // Assuming isLoading state will be added later
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-700 bg-gray-700/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md text-white"
                  >
                    <option value="">Select Art Style (Optional)...</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="anime">Anime</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="neon_punk">Neon Punk</option>
                    <option value="pixel_art">Pixel Art</option>
                    <option value="photorealistic">Photorealistic</option>
                    <option value="abstract">Abstract</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {generationMode === 'image-to-video' && (
            /* Image-to-Video Form */
            <div className="p-8 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 mb-8 text-center">
                Animate Your Image
              </h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="image-upload-itv" className="block text-sm font-medium text-gray-300 mb-1">
                    Upload Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="image-upload-itv"
                    name="image-upload-itv"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChangeITV}
                    // disabled={isLoading} // To be added later
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Accepted: JPG, PNG, GIF. Max 5MB.</p>
                  {imageErrorITV && <p className="text-xs text-red-400 mt-1">{imageErrorITV}</p>}
                  {imageFileITV && <p className="text-xs text-green-400 mt-1">Selected: {imageFileITV.name}</p>}
                </div>

                <div>
                  <label htmlFor="prompt-input-itv" className="block text-sm font-medium text-gray-300 mb-1">
                    Animation Prompt (Optional)
                  </label>
                  <textarea
                    id="prompt-input-itv"
                    name="prompt-input-itv"
                    rows={3}
                    value={prompt} // Reusing prompt state
                    onChange={(e) => setPrompt(e.target.value)}
                    // disabled={isLoading}
                    className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-700 bg-gray-700/50 rounded-md text-white p-2.5 placeholder-gray-500"
                    placeholder="e.g., Gentle zoom in, subtle parallax effect, make the clouds move..."
                  />
                </div>

                <div>
                  <label htmlFor="art-style-select-itv" className="block text-sm font-medium text-gray-300 mb-1">
                    Output Art Style (Optional)
                  </label>
                  <select
                    id="art-style-select-itv"
                    name="art-style-select-itv"
                    value={artStyle} // Reusing artStyle state
                    onChange={(e) => setArtStyle(e.target.value)}
                    // disabled={isLoading}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-700 bg-gray-700/50 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md text-white"
                  >
                    <option value="">Select Art Style...</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="anime">Anime</option>
                    <option value="fantasy">Fantasy</option>
                    {/* Add other relevant styles */}
                  </select>
                </div>
              </div>
            </div>
          )}
          {generationMode === 'video-to-video' && (
            /* Video-to-Video (Style Transfer) Form */
            <div className="p-8 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500 mb-8 text-center">
                Transform Your Video's Style
              </h3>
              <div className="space-y-6">
                {/* Content Video Input */}
                <div>
                  <label htmlFor="content-video-upload-vtv" className="block text-sm font-medium text-gray-300 mb-1">
                    Content Video <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="content-video-upload-vtv"
                    name="content-video-upload-vtv"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/avi"
                    onChange={handleContentVideoChangeVTV}
                    // disabled={isLoading}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload the video you want to restyle. Max 50MB (MP4, MOV, AVI).</p>
                  {contentVideoErrorVTV && <p className="text-xs text-red-400 mt-1">{contentVideoErrorVTV}</p>}
                  {contentVideoFileVTV && <p className="text-xs text-green-400 mt-1">Selected: {contentVideoFileVTV.name}</p>}
                </div>

                {/* Style Source Input (Image or Video) */}
                <div>
                  <label htmlFor="style-source-upload-vtv" className="block text-sm font-medium text-gray-300 mb-1">
                    Style Source (Image or Video) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="style-source-upload-vtv"
                    name="style-source-upload-vtv"
                    accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                    onChange={handleStyleSourceChangeVTV}
                    // disabled={isLoading}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload an image or video for the style. Max 20MB.</p>
                  {styleSourceErrorVTV && <p className="text-xs text-red-400 mt-1">{styleSourceErrorVTV}</p>}
                  {styleSourceFileVTV && <p className="text-xs text-green-400 mt-1">Selected: {styleSourceFileVTV.name}</p>}
                </div>

                {/* Optional Prompt */}
                <div>
                  <label htmlFor="prompt-input-vtv" className="block text-sm font-medium text-gray-300 mb-1">
                    Guiding Prompt (Optional)
                  </label>
                  <textarea
                    id="prompt-input-vtv"
                    name="prompt-input-vtv"
                    rows={3}
                    value={prompt} // Reusing prompt state
                    onChange={(e) => setPrompt(e.target.value)}
                    // disabled={isLoading}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-700 bg-gray-700/50 rounded-md text-white p-2.5 placeholder-gray-500"
                    placeholder="e.g., Make it look like a Van Gogh painting, apply a cyberpunk neon glow..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Action Button */}
        <section id="generate-action-section" className="my-10 text-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading} // Simplified for now
            className="w-full md:w-auto inline-flex justify-center items-center px-10 py-4 border border-transparent text-lg font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? `Generating... (${progress}%)` : 'Generate Content'}
          </button>
        </section>

        {/* Error Message Display */}
        {error && (
          <section id="error-message-section" className="my-6 p-6 bg-red-800/70 backdrop-blur-md border border-red-600/50 rounded-xl text-center">
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </section>
        )}

        {/* Progress Display */}
        {isLoading && progress > 0 && progress < 100 && (
          <section id="progress-section" className="my-6">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-400 to-teal-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-300 mt-2">{progress}% complete</p>
          </section>
        )}

        {/* Manual Refresh Button - shows if polling timed out or needs manual check */}
        {isManualRefreshAvailable && !isLoading && jobId && (
          <div className="text-center my-4">
            <button
              onClick={handleManualRefresh}
              className="px-6 py-2 text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              Check Status Manually
            </button>
          </div>
        )}

        {/* Result Preview */}
        {generatedVideoUrl && !isLoading && (
          <section id="result-preview-section" className="my-10 p-6 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-2xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500 mb-6">
              Generation Complete!
            </h3>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden flex justify-center items-center">
              {contentType?.startsWith('video/') ? (
                <video controls src={generatedVideoUrl} className="max-w-full max-h-full">
                  Your browser does not support the video tag.
                </video>
              ) : contentType?.startsWith('image/') ? (
                <img src={generatedVideoUrl} alt="Generated content" className="max-w-full max-h-full" />
              ) : (
                <p className="text-gray-400">Preview not available for this content type.</p>
              )}
            </div>
            <div className="mt-6 text-center">
              <a
                href={generatedVideoUrl}
                download={`generated_content.${contentType?.split('/')[1] || 'data'}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition-all duration-300 ease-in-out"
              >
                Download Result
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
