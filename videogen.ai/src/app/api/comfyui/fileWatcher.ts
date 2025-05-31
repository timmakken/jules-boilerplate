import fs from 'fs';
import { jobStore } from './jobStore';

/**
 * Watches for output files from ComfyUI and updates the job when they're found
 * @param jobId The ID of the job to watch for
 * @param maxWaitTime Maximum time to wait in milliseconds (default: 20 minutes)
 * @returns A promise that resolves when files are found or rejects on timeout
 */
export async function watchForOutputFiles(jobId: string, maxWaitTime = 20 * 60 * 1000): Promise<void> {
  const job = jobStore.getJob(jobId);
  if (!job || !job.metadata) {
    console.log(`[FileWatcher] Job ${jobId} not found or has no metadata`);
    return;
  }
  
  // Use let instead of const since these might be updated
  let { expectedImagePath, expectedVideoPath } = job.metadata;
  if (!expectedImagePath && !expectedVideoPath) {
    console.log(`[FileWatcher] No expected file paths for job ${jobId}`);
    return;
  }
  
  console.log(`[FileWatcher] Starting to watch for files for job ${jobId}`);
  console.log(`[FileWatcher] Expected image path: ${expectedImagePath}`);
  console.log(`[FileWatcher] Expected video path: ${expectedVideoPath}`);
  
  const startTime = Date.now();
  
  // Check every 10 seconds for faster response
  const checkInterval = 10 * 1000;
  
  return new Promise<void>((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        console.log(`[FileWatcher] Checking for output files for job ${jobId}`);
        
        let imageExists = false;
        let videoExists = false;
        
        // Check if image file exists - either exact path or pattern match
        if (expectedImagePath) {
          try {
            await fs.promises.access(expectedImagePath, fs.constants.F_OK);
            imageExists = true;
            console.log(`[FileWatcher] Found image file for job ${jobId}: ${expectedImagePath}`);
          } catch (error) {
            // Try to find files with the base prefix in case the numbering scheme changes
            try {
              const baseDir = 'D:\\AI_OUTPUT';
              const basePrefix = job.metadata?.filenamePrefix || '';
              
              if (basePrefix) {
                const files = await fs.promises.readdir(baseDir);
                const matchingImageFiles = files.filter(file => 
                  file.startsWith(basePrefix) && (file.endsWith('.png') || file.endsWith('.jpg'))
                );
                
                if (matchingImageFiles.length > 0) {
                  const foundImagePath = `${baseDir}\\${matchingImageFiles[0]}`;
                  console.log(`[FileWatcher] Found alternative image file for job ${jobId}: ${foundImagePath}`);
                  // Update the expected path
                  jobStore.updateJob(jobId, {
                    metadata: {
                      ...job.metadata,
                      expectedImagePath: foundImagePath
                    }
                  });
                  // Refresh job data
                  const updatedJob = jobStore.getJob(jobId);
                  if (updatedJob && updatedJob.metadata) {
                    expectedImagePath = updatedJob.metadata.expectedImagePath;
                  }
                  imageExists = true;
                } else {
                  console.log(`[FileWatcher] No matching image files found for prefix ${basePrefix}`);
                }
              }
            } catch (dirError) {
              console.error(`[FileWatcher] Error searching directory for image files:`, dirError);
              console.log(`[FileWatcher] Image file not found yet for job ${jobId}`);
            }
          }
        }
        
        // Check if video file exists - either exact path or pattern match
        if (expectedVideoPath) {
          try {
            await fs.promises.access(expectedVideoPath, fs.constants.F_OK);
            videoExists = true;
            console.log(`[FileWatcher] Found video file for job ${jobId}: ${expectedVideoPath}`);
          } catch (error) {
            // Try to find files with the base prefix in case the numbering scheme changes
            try {
              const baseDir = 'D:\\AI_OUTPUT';
              const basePrefix = job.metadata?.filenamePrefix || '';
              
              if (basePrefix) {
                const files = await fs.promises.readdir(baseDir);
                const matchingVideoFiles = files.filter(file => 
                  file.startsWith(basePrefix) && file.endsWith('.mp4')
                );
                
                if (matchingVideoFiles.length > 0) {
                  const foundVideoPath = `${baseDir}\\${matchingVideoFiles[0]}`;
                  console.log(`[FileWatcher] Found alternative video file for job ${jobId}: ${foundVideoPath}`);
                  // Update the expected path
                  jobStore.updateJob(jobId, {
                    metadata: {
                      ...job.metadata,
                      expectedVideoPath: foundVideoPath
                    }
                  });
                  // Refresh job data
                  const updatedJob = jobStore.getJob(jobId);
                  if (updatedJob && updatedJob.metadata) {
                    expectedVideoPath = updatedJob.metadata.expectedVideoPath;
                  }
                  videoExists = true;
                } else {
                  console.log(`[FileWatcher] No matching video files found for prefix ${basePrefix}`);
                }
              }
            } catch (dirError) {
              console.error(`[FileWatcher] Error searching directory for video files:`, dirError);
              console.log(`[FileWatcher] Video file not found yet for job ${jobId}`);
            }
          }
        }
        
        if (imageExists || videoExists) {
          clearInterval(intervalId);
          
          // Read the files and update the job
          if (imageExists) {
            try {
              console.log(`[FileWatcher] Reading image file for job ${jobId}`);
              const imageData = await fs.promises.readFile(expectedImagePath!);
              console.log(`[FileWatcher] Image file size: ${imageData.length} bytes`);
              
              // Create a proper blob with the correct MIME type
              const imageBlob = new Blob([imageData], { type: 'image/png' });
              console.log(`[FileWatcher] Created image blob: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
              jobStore.updateJob(jobId, { 
                imageResult: imageBlob,
                hasImage: true
              });
              console.log(`[FileWatcher] Successfully read image file for job ${jobId}`);
            } catch (error) {
              console.error(`[FileWatcher] Error reading image file for job ${jobId}:`, error);
            }
          }
          
          if (videoExists) {
            try {
              console.log(`[FileWatcher] Reading video file for job ${jobId}`);
              const videoData = await fs.promises.readFile(expectedVideoPath!);
              console.log(`[FileWatcher] Video file size: ${videoData.length} bytes`);
              
              // Create a proper blob with the correct MIME type
              const videoBlob = new Blob([videoData], { type: 'video/mp4' });
              console.log(`[FileWatcher] Created video blob: ${videoBlob.size} bytes, type: ${videoBlob.type}`);
              jobStore.updateJob(jobId, { 
                videoResult: videoBlob,
                hasVideo: true
              });
              console.log(`[FileWatcher] Successfully read video file for job ${jobId}`);
            } catch (error) {
              console.error(`[FileWatcher] Error reading video file for job ${jobId}:`, error);
            }
          }
          
          // Mark job as completed
          jobStore.updateJob(jobId, {
            status: 'completed',
            completedAt: new Date()
          });
          
          console.log(`[FileWatcher] Job ${jobId} marked as completed`);
          resolve();
        } else {
          // Check if we've exceeded the maximum wait time
          const elapsedTime = Date.now() - startTime;
          const remainingTime = maxWaitTime - elapsedTime;
          
          if (remainingTime <= 0) {
            clearInterval(intervalId);
            console.log(`[FileWatcher] Timed out waiting for output files for job ${jobId}`);
            
            jobStore.updateJob(jobId, {
              status: 'failed',
              error: 'Timed out waiting for output files',
              completedAt: new Date()
            });
            
            reject(new Error('Timed out waiting for output files'));
          } else {
            const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
            console.log(`[FileWatcher] No files found yet for job ${jobId}. Will check again in 2 minutes. ${remainingMinutes} minutes remaining.`);
          }
        }
      } catch (error) {
        console.error(`[FileWatcher] Error checking output files for job ${jobId}:`, error);
      }
    }, checkInterval);
    
    // Also do an immediate check
    setTimeout(async () => {
      try {
        console.log(`[FileWatcher] Doing initial check for output files for job ${jobId}`);
        
        let imageExists = false;
        let videoExists = false;
        
        // Check if image file exists - either exact path or pattern match
        if (expectedImagePath) {
          try {
            await fs.promises.access(expectedImagePath, fs.constants.F_OK);
            imageExists = true;
            console.log(`[FileWatcher] Found image file for job ${jobId}: ${expectedImagePath}`);
          } catch (error) {
            // Try to find files with the base prefix in case the numbering scheme changes
            try {
              const baseDir = 'D:\\AI_OUTPUT';
              const basePrefix = job.metadata?.filenamePrefix || '';
              
              if (basePrefix) {
                const files = await fs.promises.readdir(baseDir);
                const matchingImageFiles = files.filter(file => 
                  file.startsWith(basePrefix) && (file.endsWith('.png') || file.endsWith('.jpg'))
                );
                
                if (matchingImageFiles.length > 0) {
                  const foundImagePath = `${baseDir}\\${matchingImageFiles[0]}`;
                  console.log(`[FileWatcher] Found alternative image file for job ${jobId}: ${foundImagePath}`);
                  // Update the expected path
                  jobStore.updateJob(jobId, {
                    metadata: {
                      ...job.metadata,
                      expectedImagePath: foundImagePath
                    }
                  });
                  // Refresh job data
                  const updatedJob = jobStore.getJob(jobId);
                  if (updatedJob && updatedJob.metadata) {
                    expectedImagePath = updatedJob.metadata.expectedImagePath;
                  }
                  imageExists = true;
                } else {
                  console.log(`[FileWatcher] No matching image files found for prefix ${basePrefix}`);
                }
              }
            } catch (dirError) {
              console.error(`[FileWatcher] Error searching directory for image files:`, dirError);
              console.log(`[FileWatcher] Image file not found yet for job ${jobId}`);
            }
          }
        }
        
        // Check if video file exists - either exact path or pattern match
        if (expectedVideoPath) {
          try {
            await fs.promises.access(expectedVideoPath, fs.constants.F_OK);
            videoExists = true;
            console.log(`[FileWatcher] Found video file for job ${jobId}: ${expectedVideoPath}`);
          } catch (error) {
            // Try to find files with the base prefix in case the numbering scheme changes
            try {
              const baseDir = 'D:\\AI_OUTPUT';
              const basePrefix = job.metadata?.filenamePrefix || '';
              
              if (basePrefix) {
                const files = await fs.promises.readdir(baseDir);
                const matchingVideoFiles = files.filter(file => 
                  file.startsWith(basePrefix) && file.endsWith('.mp4')
                );
                
                if (matchingVideoFiles.length > 0) {
                  const foundVideoPath = `${baseDir}\\${matchingVideoFiles[0]}`;
                  console.log(`[FileWatcher] Found alternative video file for job ${jobId}: ${foundVideoPath}`);
                  // Update the expected path
                  jobStore.updateJob(jobId, {
                    metadata: {
                      ...job.metadata,
                      expectedVideoPath: foundVideoPath
                    }
                  });
                  // Refresh job data
                  const updatedJob = jobStore.getJob(jobId);
                  if (updatedJob && updatedJob.metadata) {
                    expectedVideoPath = updatedJob.metadata.expectedVideoPath;
                  }
                  videoExists = true;
                } else {
                  console.log(`[FileWatcher] No matching video files found for prefix ${basePrefix}`);
                }
              }
            } catch (dirError) {
              console.error(`[FileWatcher] Error searching directory for video files:`, dirError);
              console.log(`[FileWatcher] Video file not found yet for job ${jobId}`);
            }
          }
        }
        
        if (imageExists || videoExists) {
          clearInterval(intervalId);
          
          // Read the files and update the job
          if (imageExists) {
            try {
              console.log(`[FileWatcher] Reading image file for job ${jobId}`);
              const imageData = await fs.promises.readFile(expectedImagePath!);
              console.log(`[FileWatcher] Image file size: ${imageData.length} bytes`);
              
              // Create a proper blob with the correct MIME type
              const imageBlob = new Blob([imageData], { type: 'image/png' });
              console.log(`[FileWatcher] Created image blob: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
              jobStore.updateJob(jobId, { 
                imageResult: imageBlob,
                hasImage: true
              });
              console.log(`[FileWatcher] Successfully read image file for job ${jobId}`);
            } catch (error) {
              console.error(`[FileWatcher] Error reading image file for job ${jobId}:`, error);
            }
          }
          
          if (videoExists) {
            try {
              console.log(`[FileWatcher] Reading video file for job ${jobId}`);
              const videoData = await fs.promises.readFile(expectedVideoPath!);
              console.log(`[FileWatcher] Video file size: ${videoData.length} bytes`);
              
              // Create a proper blob with the correct MIME type
              const videoBlob = new Blob([videoData], { type: 'video/mp4' });
              console.log(`[FileWatcher] Created video blob: ${videoBlob.size} bytes, type: ${videoBlob.type}`);
              jobStore.updateJob(jobId, { 
                videoResult: videoBlob,
                hasVideo: true
              });
              console.log(`[FileWatcher] Successfully read video file for job ${jobId}`);
            } catch (error) {
              console.error(`[FileWatcher] Error reading video file for job ${jobId}:`, error);
            }
          }
          
          // Mark job as completed
          jobStore.updateJob(jobId, {
            status: 'completed',
            completedAt: new Date()
          });
          
          console.log(`[FileWatcher] Job ${jobId} marked as completed`);
          resolve();
        }
      } catch (error) {
        console.error(`[FileWatcher] Error in initial check for job ${jobId}:`, error);
      }
    }, 100);
  });
}
