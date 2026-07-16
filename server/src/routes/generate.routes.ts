/**
 * AI generation routes
 * Handles course and lesson content generation using Gemini
 */

import { Router } from 'express';
import { generateCourse, generateLesson } from '../controllers/generate.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { body } from 'express-validator';

const router = Router();

// All generation routes require authentication
router.use(authMiddleware);

const courseValidation = [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('moduleCount').optional().isInt({ min: 2, max: 10 }),
  body('lessonCount').optional().isInt({ min: 2, max: 8 })
];

const lessonValidation = [
  body('courseTitle').notEmpty().withMessage('Course title is required'),
  body('moduleTitle').notEmpty().withMessage('Module title is required'),
  body('lessonTitle').notEmpty().withMessage('Lesson title is required')
];

router.post('/course', courseValidation, generateCourse);
router.post('/lesson', lessonValidation, generateLesson);

export default router;
