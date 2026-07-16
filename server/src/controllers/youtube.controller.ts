/**
 * YouTube Controller
 * Handles YouTube video search using YouTube Data API v3
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import { searchYouTubeVideos } from '../services/youtube.service';

/**
 * Search YouTube videos
 */
export const searchVideos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const query = req.query.q as string;
    const maxResults = parseInt(req.query.maxResults as string) || 5;

    console.log(`🔍 Searching YouTube for: "${query}"`);

    const videos = await searchYouTubeVideos(query, maxResults);

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('❌ YouTube search error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to search videos'
    });
  }
};
