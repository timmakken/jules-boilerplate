// Simple in-memory job store for ComfyUI jobs
// In a production environment, this should be replaced with a database

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  result?: Blob;
  error?: string;
  // New fields for file monitoring
  metadata?: {
    filenamePrefix?: string;
    expectedImagePath?: string;
    expectedVideoPath?: string;
  };
  imageResult?: Blob;
  videoResult?: Blob;
  hasImage?: boolean;
  hasVideo?: boolean;
}

class JobStore {
  private jobs: Map<string, Job> = new Map();

  createJob(): Job {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: Job = {
      id,
      status: 'pending',
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Clean up old jobs (optional, for memory management)
  cleanupOldJobs(maxAgeHours = 24): void {
    const now = new Date();
    for (const [id, job] of this.jobs.entries()) {
      const ageHours = (now.getTime() - job.createdAt.getTime()) / (1000 * 60 * 60);
      if (ageHours > maxAgeHours) {
        this.jobs.delete(id);
      }
    }
  }
}

// Export a singleton instance
export const jobStore = new JobStore();
