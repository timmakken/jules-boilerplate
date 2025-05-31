import { NextRequest, NextResponse } from 'next/server';
import { jobStore } from '../../jobStore';

export async function GET(request: NextRequest) {
  try {
    // Create a new job
    const job = jobStore.createJob();
    console.log(`[Debug] Created test job with ID: ${job.id}`);
    
    // Update job status to processing
    jobStore.updateJob(job.id, { status: 'processing' });
    
    // Simulate a ComfyUI request
    simulateComfyUIRequest(job.id).catch(error => {
      console.error('[Debug] Error in simulated ComfyUI request:', error);
    });
    
    // Return the job ID
    return NextResponse.json({
      jobId: job.id,
      status: 'processing',
      message: 'Test job created successfully. Check the status endpoint for updates.',
      createdAt: job.createdAt
    });
  } catch (error) {
    console.error('[Debug] Error creating test job:', error);
    
    let errorMessage = 'Failed to create test job';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json({
      status: 'error',
      message: errorMessage,
    }, { status: 500 });
  }
}

// Simulate a ComfyUI request
async function simulateComfyUIRequest(jobId: string) {
  console.log(`[Debug] Simulating ComfyUI request for job ${jobId}`);
  
  try {
    // Wait for 3 seconds to simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 50% chance of success, 50% chance of failure
    const success = Math.random() > 0.5;
    
    if (success) {
      console.log(`[Debug] Simulated ComfyUI request succeeded for job ${jobId}`);
      
      // Create a simple test result as a blob (Node.js compatible)
      const textEncoder = new TextEncoder();
      const testData = JSON.stringify({
        message: 'This is a test image placeholder',
        jobId: jobId,
        timestamp: new Date().toISOString()
      });
      const uint8Array = textEncoder.encode(testData);
      const blob = new Blob([uint8Array], { type: 'application/json' });
      
      // Update job with the result
      jobStore.updateJob(jobId, {
        status: 'completed',
        result: blob,
        completedAt: new Date()
      });
    } else {
      console.log(`[Debug] Simulated ComfyUI request failed for job ${jobId}`);
      
      // Update job status to failed
      jobStore.updateJob(jobId, {
        status: 'failed',
        error: 'Simulated ComfyUI error for testing purposes',
        completedAt: new Date()
      });
    }
  } catch (error) {
    console.error(`[Debug] Error in simulated ComfyUI request for job ${jobId}:`, error);
    
    let errorMessage = 'Simulated ComfyUI error';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    // Update job status to failed
    jobStore.updateJob(jobId, {
      status: 'failed',
      error: errorMessage,
      completedAt: new Date()
    });
  }
}
