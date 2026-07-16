import { Router } from 'express';
import { getJobStatus } from '../controllers/job.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Get job status by ID
router.get('/:jobId', authMiddleware, getJobStatus);

export default router;
