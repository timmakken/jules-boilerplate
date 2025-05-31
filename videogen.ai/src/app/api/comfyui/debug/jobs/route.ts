import { NextRequest, NextResponse } from 'next/server';
import { jobStore } from '../../jobStore';

export async function GET(request: NextRequest) {
  try {
    // Get all jobs from the job store
    // Since we don't have a direct method to get all jobs, we'll need to add one
    
    // First, let's add a method to the jobStore to get recent jobs
    // This is a temporary solution for debugging purposes
    const recentJobs = getRecentJobs();
    
    // Return the recent jobs
    return NextResponse.json({
      jobs: recentJobs
    });
  } catch (error) {
    console.error('[Debug] Error getting recent jobs:', error);
    
    let errorMessage = 'Failed to get recent jobs';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json({
      status: 'error',
      message: errorMessage,
    }, { status: 500 });
  }
}

// Function to get recent jobs from the job store
// This is a workaround since we don't have direct access to the job store's internal Map
function getRecentJobs() {
  // We'll use a hack to access the private jobs Map in the jobStore
  // This is not ideal, but it's just for debugging purposes
  
  // @ts-ignore - Accessing private property for debugging
  const jobsMap = (jobStore as any).jobs;
  
  if (!jobsMap || !(jobsMap instanceof Map)) {
    console.warn('[Debug] Could not access jobs Map in jobStore');
    return [];
  }
  
  // Convert the Map to an array of jobs
  const jobs = Array.from(jobsMap.values());
  
  // Sort by creation date (newest first)
  jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Return only the most recent 10 jobs
  return jobs.slice(0, 10).map(job => ({
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
    // Don't include the actual blob data, just metadata
    resultType: job.result?.type,
    resultSize: job.result?.size
  }));
}
