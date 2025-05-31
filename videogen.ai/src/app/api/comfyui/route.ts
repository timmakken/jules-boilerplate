import { NextRequest, NextResponse } from 'next/server';
import { jobStore } from './jobStore';
import { watchForOutputFiles } from './fileWatcher';

// Set a shorter timeout for the ComfyUI request (5 minutes in milliseconds)
// We don't need a long timeout since we're using the file watcher as the primary mechanism
const COMFY_UI_TIMEOUT = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  // Create a new job
  const job = jobStore.createJob();
  try {
    // The incoming request body is already a ReadableStream of FormData.
    // We will pass it directly to the fetch call to ComfyUI.

    const comfyUIApiUrl = process.env.COMFYUI_API_URL || 'http://127.0.0.1:3107/generate';

    // Determine Accept header for ComfyUI request based on frontend's Accept header
    // This part remains important if the client can request different types of content.
    // For now, it's usually application/octet-stream for the generated image/video.
    let acceptHeader = 'application/octet-stream'; // Default, as per OpenAPI spec for success
    const clientAcceptHeader = request.headers.get('accept');
    if (clientAcceptHeader && 
        (clientAcceptHeader.includes('application/octet-stream') || 
         clientAcceptHeader.includes('image/*') || 
         clientAcceptHeader.includes('video/*'))) {
      acceptHeader = clientAcceptHeader; // Or be more specific if needed
    }
    
    // Instead of waiting for the ComfyUI response, we'll process it asynchronously
    // and return the job ID immediately
    const formData = await request.formData();
    
    // Log the form data keys and values to help with debugging
    console.log('FormData keys:', [...formData.keys()]);
    
    // Log detailed information about each form data entry
    for (const key of formData.keys()) {
      const value = formData.get(key);
      if (value instanceof File) {
        console.log(`FormData ${key}: File (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`FormData ${key}: ${value}`);
      }
    }
    
    // Log the Prompt value as-is without modifying it
    if (formData.has('Prompt')) {
      const promptValue = formData.get('Prompt');
      if (promptValue && typeof promptValue === 'string') {
        console.log(`[ComfyUI] Prompt value: ${promptValue}`);
      }
    }
    
    // Update job status to processing
    jobStore.updateJob(job.id, { status: 'processing' });
    
    // Return the job ID immediately
    const response = NextResponse.json({ 
      jobId: job.id, 
      status: 'processing',
      message: 'Your request is being processed. Check the status endpoint for updates.'
    });
    
    // Generate a filename prefix for this job
    const timestamp = Date.now();
    const filenamePrefix = `vace_${job.id.split('_')[2]}`;
    
    // Add the filename prefix to the form data as plain text
    formData.append('Filename_prefix', filenamePrefix);
    
    // Store the expected filenames in the job metadata
    // ComfyUI adds "_00001" to the filename, so we need to account for that
    jobStore.updateJob(job.id, { 
      metadata: {
        filenamePrefix,
        expectedImagePath: `D:\\AI_OUTPUT\\${filenamePrefix}_00001.png`,
        expectedVideoPath: `D:\\AI_OUTPUT\\${filenamePrefix}_00001.mp4`,
      }
    });
    
    console.log(`[ComfyUI] Added filename prefix: ${filenamePrefix}`);
    console.log(`[ComfyUI] Expected image path: D:\\AI_OUTPUT\\${filenamePrefix}_00001.png`);
    console.log(`[ComfyUI] Expected video path: D:\\AI_OUTPUT\\${filenamePrefix}_00001.mp4`);
    
    // Process the ComfyUI request in the background
    processComfyUIRequest(comfyUIApiUrl, formData, acceptHeader, job.id).catch(error => {
      console.error('Background processing error:', error);
    });
    
    return response;
  } catch (error) {
    console.error('Error setting up ComfyUI request:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Update job status to failed
    jobStore.updateJob(job.id, { 
      status: 'failed', 
      error: errorMessage,
      completedAt: new Date()
    });
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Process the ComfyUI request asynchronously
async function processComfyUIRequest(
  comfyUIApiUrl: string, 
  formData: FormData, 
  acceptHeader: string,
  jobId: string
) {
  console.log(`[ComfyUI] Processing request for job ${jobId}`);
  console.log(`[ComfyUI] API URL: ${comfyUIApiUrl}`);
  console.log(`[ComfyUI] Accept header: ${acceptHeader}`);
  console.log(`[ComfyUI] FormData keys: ${[...formData.keys()]}`);
  
  // Log detailed information about each form data entry
  for (const key of formData.keys()) {
    const value = formData.get(key);
    if (value instanceof File) {
      console.log(`[ComfyUI] FormData ${key}: File (${value.size} bytes, ${value.type})`);
    } else {
      console.log(`[ComfyUI] FormData ${key}: ${value}`);
    }
  }
  
  // Create an AbortController with a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), COMFY_UI_TIMEOUT);
  
  // Start watching for output files regardless of fetch success
  console.log(`[ComfyUI] Starting file watcher for job ${jobId}`);
  watchForOutputFiles(jobId).catch(error => {
    console.error(`[ComfyUI] Error in file watcher for job ${jobId}:`, error);
  });
  
  try {
    console.log(`[ComfyUI] Sending request to ComfyUI...`);
    const comfyUIResponse = await fetch(comfyUIApiUrl, {
      method: 'POST',
      headers: {
        // Content-Type will be set automatically for FormData
        'Accept': acceptHeader,
      },
      body: formData,
      signal: controller.signal,
    });
    
    console.log(`[ComfyUI] Response status: ${comfyUIResponse.status} ${comfyUIResponse.statusText}`);
    
    // Clear the timeout if the request completes before the timeout
    clearTimeout(timeoutId);
    
    const responseContentType = comfyUIResponse.headers.get('Content-Type');
    
    if (comfyUIResponse.ok) {
      console.log(`[ComfyUI] Response content type: ${responseContentType}`);
      
      // Store the initial response as well
      if (responseContentType && (
          responseContentType.includes('application/octet-stream') || 
          responseContentType.startsWith('image/') || 
          responseContentType.startsWith('video/')
      )) {
        // For binary data like images/videos
        console.log(`[ComfyUI] Processing binary response...`);
        const blob = await comfyUIResponse.blob();
        console.log(`[ComfyUI] Blob size: ${blob.size} bytes, type: ${blob.type}`);
        
        // Update job with the result
        const updatedJob = jobStore.updateJob(jobId, {
          result: blob
        });
        
        console.log(`[ComfyUI] Job ${jobId} updated with binary result.`);
      } else {
        // If ComfyUI returns an OK response but not an octet-stream
        console.log(`[ComfyUI] Processing JSON response...`);
        const responseData = await comfyUIResponse.json();
        console.log('[ComfyUI] Success response (non-binary):', responseData);
        
        // Convert the JSON response to a blob
        const blob = new Blob([JSON.stringify(responseData)], { type: 'application/json' });
        console.log(`[ComfyUI] Created JSON blob: ${blob.size} bytes`);
        
        // Update job with the result
        const updatedJob = jobStore.updateJob(jobId, {
          result: blob
        });
        
        console.log(`[ComfyUI] Job ${jobId} updated with JSON result.`);
      }
    } else {
      // Handle non-OK responses (errors)
      console.log(`[ComfyUI] Error response: ${comfyUIResponse.status} ${comfyUIResponse.statusText}`);
      let errorMessage = `Error: ${comfyUIResponse.status} ${comfyUIResponse.statusText}`;
      
      try {
        const errorData = await comfyUIResponse.json();
        console.error('[ComfyUI] Error response data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('[ComfyUI] Failed to parse error response as JSON:', e);
        try {
          const errorText = await comfyUIResponse.text();
          console.error('[ComfyUI] Error response text:', errorText);
          if (errorText) errorMessage = errorText;
        } catch (e) { 
          console.error('[ComfyUI] Failed to get error response as text:', e);
        }
      }
      
      // Update job status to failed
      const updatedJob = jobStore.updateJob(jobId, {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date()
      });
      
      console.log(`[ComfyUI] Job ${jobId} updated with error. Status: ${updatedJob?.status}`);
    }
  } catch (error) {
    // Clear the timeout if an error occurs
    clearTimeout(timeoutId);
    
    console.error('[ComfyUI] Error processing ComfyUI request:', error);
    let errorMessage = 'Internal Server Error';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'The request to ComfyUI timed out. The generation process may take longer than expected.';
      } else {
        errorMessage = error.message;
      }
      console.error(`[ComfyUI] Error details: ${error.name}: ${error.message}`);
      if (error.stack) {
        console.error(`[ComfyUI] Stack trace: ${error.stack}`);
      }
    }
    
    // Don't mark the job as failed yet, since we're still watching for output files
    console.log(`[ComfyUI] Fetch request failed, but file watcher is still active for job ${jobId}`);
    console.log(`[ComfyUI] Error message: ${errorMessage}`);
    
    // Update job with the error message but keep status as processing
    const updatedJob = jobStore.updateJob(jobId, {
      error: `Fetch request failed: ${errorMessage}. Waiting for output files.`
    });
  }
}
