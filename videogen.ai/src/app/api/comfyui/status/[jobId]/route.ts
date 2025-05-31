import { NextRequest, NextResponse } from 'next/server';
import { jobStore } from '../../jobStore';

export async function GET(
  request: NextRequest,
  context: { params: { jobId: string } }
) {
  try {
    console.log(`[Status] Received status request with context:`, context);
    
    // Explicitly await the params object before accessing its properties
    const { jobId } = await Promise.resolve(context.params);
    console.log(`[Status] Extracted jobId: ${jobId}`);
    
    if (!jobId) {
      console.log(`[Status] No jobId provided`);
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    console.log(`[Status] Looking up job with ID: ${jobId}`);
    const job = jobStore.getJob(jobId);
    
    if (!job) {
      console.log(`[Status] Job not found: ${jobId}`);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.log(`[Status] Found job ${jobId} with status: ${job.status}`);
    
    // If the job is completed and has results, return the results
    if (job.status === 'completed') {
      try {
        // Check for image and video results from file watcher
        if (job.hasImage && job.imageResult) {
          console.log(`[Status] Job ${jobId} has image result. Blob type: ${job.imageResult.type}, size: ${job.imageResult.size} bytes`);
          
          try {
            // Create a new blob with explicit type to ensure proper handling
            const arrayBuffer = await job.imageResult.arrayBuffer();
            console.log(`[Status] Image converted to arrayBuffer: ${arrayBuffer.byteLength} bytes`);
            
            const newBlob = new Blob([arrayBuffer], { type: 'image/png' });
            console.log(`[Status] Created new image blob: ${newBlob.size} bytes, type: ${newBlob.type}`);
            
            // Return the image result with explicit headers
            return new NextResponse(newBlob, {
              headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `inline; filename="generated_image.png"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
            });
          } catch (error) {
            console.error(`[Status] Error processing image blob for job ${jobId}:`, error);
            throw error;
          }
        }
        
        if (job.hasVideo && job.videoResult) {
          console.log(`[Status] Job ${jobId} has video result. Blob type: ${job.videoResult.type}, size: ${job.videoResult.size} bytes`);
          
          try {
            // Create a new blob with explicit type to ensure proper handling
            const arrayBuffer = await job.videoResult.arrayBuffer();
            console.log(`[Status] Video converted to arrayBuffer: ${arrayBuffer.byteLength} bytes`);
            
            const newBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
            console.log(`[Status] Created new video blob: ${newBlob.size} bytes, type: ${newBlob.type}`);
            
            // Return the video result with explicit headers
            return new NextResponse(newBlob, {
              headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `inline; filename="generated_video.mp4"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
            });
          } catch (error) {
            console.error(`[Status] Error processing video blob for job ${jobId}:`, error);
            throw error;
          }
        }
        
        // Fall back to the original result if available
        if (job.result) {
          console.log(`[Status] Job ${jobId} has original result. Blob type: ${job.result.type}, size: ${job.result.size} bytes`);
          
          try {
            // Create a new blob with explicit type to ensure proper handling
            const arrayBuffer = await job.result.arrayBuffer();
            console.log(`[Status] Result converted to arrayBuffer: ${arrayBuffer.byteLength} bytes`);
            
            // Determine the content type based on the original blob or default to octet-stream
            const contentType = job.result.type || 'application/octet-stream';
            console.log(`[Status] Using content type: ${contentType}`);
            
            const newBlob = new Blob([arrayBuffer], { type: contentType });
            console.log(`[Status] Created new result blob: ${newBlob.size} bytes, type: ${newBlob.type}`);
            
            // Determine the file extension based on the content type
            const fileExt = contentType.split('/')[1] || 'bin';
            
            // Return the result with explicit headers
            return new NextResponse(newBlob, {
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="generated_content.${fileExt}"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
            });
          } catch (error) {
            console.error(`[Status] Error processing result blob for job ${jobId}:`, error);
            throw error;
          }
        }
        
        // If we get here, the job is completed but has no results yet
        console.log(`[Status] Job ${jobId} is completed but has no results yet`);
        return NextResponse.json({
          id: job.id,
          status: job.status,
          message: 'Job is completed but results are still being processed',
          createdAt: job.createdAt,
          completedAt: job.completedAt
        });
      } catch (error) {
        console.error(`[Status] Error returning blob for job ${jobId}:`, error);
        if (error instanceof Error) {
          console.error(`[Status] Error details: ${error.name}: ${error.message}`);
          if (error.stack) {
            console.error(`[Status] Stack trace: ${error.stack}`);
          }
        }
        return NextResponse.json({ 
          error: 'Error processing the generated content',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // If the job failed, return the error
    if (job.status === 'failed') {
      console.log(`[Status] Job ${jobId} failed with error: ${job.error}`);
      return NextResponse.json({ 
        status: job.status, 
        error: job.error || 'Unknown error',
        createdAt: job.createdAt,
        completedAt: job.completedAt
      }, { status: 500 });
    }
    
    // If the job is still processing but has an error message, include it in the response
    if (job.status === 'processing' && job.error) {
      console.log(`[Status] Job ${jobId} is processing with warning: ${job.error}`);
      return NextResponse.json({
        id: job.id,
        status: job.status,
        warning: job.error,
        message: 'Job is still processing despite fetch error. Waiting for output files.',
        createdAt: job.createdAt
      });
    }

    // Otherwise, return the job status
    console.log(`[Status] Returning status for job ${jobId}: ${job.status}`);
    return NextResponse.json({
      id: job.id,
      status: job.status,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });
  } catch (error) {
    console.error('[Status] Error in job status endpoint:', error);
    if (error instanceof Error) {
      console.error(`[Status] Error details: ${error.name}: ${error.message}`);
      if (error.stack) {
        console.error(`[Status] Stack trace: ${error.stack}`);
      }
    }
    return NextResponse.json({ 
      error: 'Internal server error while checking job status' 
    }, { status: 500 });
  }
}
