import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { jobStore } from '../jobStore';
import { watchForOutputFiles } from '../fileWatcher';

// This is a test endpoint to verify that the file watcher works correctly
export async function GET(request: NextRequest) {
  try {
    // Create a test job
    const job = jobStore.createJob();
    
    // Generate a filename prefix
    const filenamePrefix = `test_${job.id.split('_')[2]}`;
    
    // Set up the expected file paths
    const expectedImagePath = `D:\\AI_OUTPUT\\${filenamePrefix}.png`;
    const expectedVideoPath = `D:\\AI_OUTPUT\\${filenamePrefix}.mp4`;
    
    // Update the job with the metadata
    jobStore.updateJob(job.id, {
      status: 'processing',
      metadata: {
        filenamePrefix,
        expectedImagePath,
        expectedVideoPath
      }
    });
    
    console.log(`[TestFileWatcher] Created test job with ID: ${job.id}`);
    console.log(`[TestFileWatcher] Expected image path: ${expectedImagePath}`);
    console.log(`[TestFileWatcher] Expected video path: ${expectedVideoPath}`);
    
    // Start the file watcher
    watchForOutputFiles(job.id, 5 * 60 * 1000) // 5 minute timeout for testing
      .then(() => {
        console.log(`[TestFileWatcher] File watcher completed for job ${job.id}`);
      })
      .catch(error => {
        console.error(`[TestFileWatcher] File watcher error for job ${job.id}:`, error);
      });
    
    // Create a test image file (a small 1x1 pixel PNG)
    const testImageData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Write the test files after a short delay to simulate the ComfyUI process
    setTimeout(async () => {
      try {
        // Ensure the directory exists
        const dir = 'D:\\AI_OUTPUT';
        try {
          await fs.promises.access(dir, fs.constants.F_OK);
        } catch (error) {
          // Directory doesn't exist, create it
          await fs.promises.mkdir(dir, { recursive: true });
          console.log(`[TestFileWatcher] Created directory: ${dir}`);
        }
        
        // Write the test image file
        await fs.promises.writeFile(expectedImagePath, testImageData);
        console.log(`[TestFileWatcher] Created test image file: ${expectedImagePath}`);
        
        // We'll skip creating the video file for this test
      } catch (error) {
        console.error(`[TestFileWatcher] Error creating test files:`, error);
      }
    }, 5000); // 5 second delay
    
    return NextResponse.json({
      message: 'Test file watcher started',
      jobId: job.id,
      expectedImagePath,
      expectedVideoPath
    });
  } catch (error) {
    console.error('[TestFileWatcher] Error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
