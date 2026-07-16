/**
 * Test Routes
 * For testing API integrations without authentication
 */

import { Router, Request, Response } from 'express';
import { testGeminiConnection } from '../services/gemini.service';

const router = Router();

/**
 * Test Gemini API connection
 * GET /api/test/gemini
 */
router.get('/gemini', async (_req: Request, res: Response) => {
  try {
    console.log('📡 Test endpoint called: /api/test/gemini');
    const result = await testGeminiConnection();
    
    res.status(200).json({
      success: true,
      message: '✅ Gemini key verified and working',
      data: {
        response: result,
        model: 'gemini-1.5-flash',
        status: 'API connection successful'
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Gemini API test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Health check for test routes
 * GET /api/test/health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Test routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;
