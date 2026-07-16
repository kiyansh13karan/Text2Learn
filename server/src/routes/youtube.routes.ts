/**
 * YouTube API routes
 * Searches and fetches YouTube video data
 */

import { Router } from 'express';
import { searchVideos } from '../controllers/youtube.controller';
import { query } from 'express-validator';

const router = Router();

// Note: YouTube search doesn't require authentication since it's public video data
// Authentication is handled by the YouTube API key itself

const searchValidation = [
  query('q').notEmpty().withMessage('Search query is required'),
  query('maxResults').optional().isInt({ min: 1, max: 10 })
];

router.get('/search', searchValidation, searchVideos);

export default router;
