import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';

export const getJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    // Ensure the user owns the job
    if (job.userId !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized access to job' });
      return;
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch job status'
    });
  }
};
