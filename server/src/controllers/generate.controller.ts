/**
 * AI Generation Controller
 * Handles course and lesson generation using Gemini API
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import { enqueueJob } from '../services/queue.service';
import { getCachedResult, generateCourseCacheKey, generateLessonCacheKey } from '../services/cache.service';
import { prisma } from '../utils/prisma';

/**
 * Enqueue a course generation job
 */
export const generateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { topic, moduleCount = 5, lessonCount = 4 } = req.body;

    const cacheKey = generateCourseCacheKey(topic, moduleCount, lessonCount);
    const cached = await getCachedResult(cacheKey);

    if (cached) {
      console.log(`🚀 Cache hit for course: "${topic}"`);
      // Create a DB job representing instant completion so frontend polling works smoothly
      const dbJob = await prisma.job.create({
        data: {
          userId: req.user.userId,
          type: 'course_generation',
          data: { topic, moduleCount, lessonCount },
          status: 'COMPLETED',
          result: cached
        }
      });
      res.status(202).json({
        success: true,
        data: { jobId: dbJob.id },
        message: 'Course generation returned from cache'
      });
      return;
    }

    console.log(`Enqueueing course generation for topic: "${topic}"`);

    // Enqueue course generation job
    const jobId = await enqueueJob(req.user.userId, 'course_generation', { topic, moduleCount, lessonCount });

    res.status(202).json({
      success: true,
      data: { jobId },
      message: 'Course generation job started'
    });
  } catch (error) {
    console.error('Generate course error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to enqueue course generation'
    });
  }
};

/**
 * Enqueue detailed lesson content generation
 */
export const generateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { courseTitle, moduleTitle, lessonTitle, previousLessons = [] } = req.body;

    const cacheKey = generateLessonCacheKey(courseTitle, moduleTitle, lessonTitle);
    const cached = await getCachedResult(cacheKey);

    if (cached) {
      console.log(`🚀 Cache hit for lesson: "${lessonTitle}"`);
      const dbJob = await prisma.job.create({
        data: {
          userId: req.user.userId,
          type: 'lesson_generation',
          data: { courseTitle, moduleTitle, lessonTitle, previousLessons },
          status: 'COMPLETED',
          result: cached
        }
      });
      res.status(202).json({
        success: true,
        data: { jobId: dbJob.id },
        message: 'Lesson generation returned from cache'
      });
      return;
    }

    console.log(`Enqueueing lesson: "${lessonTitle}" for module: "${moduleTitle}"`);

    // Enqueue lesson content generation job
    const jobId = await enqueueJob(req.user.userId, 'lesson_generation', { courseTitle, moduleTitle, lessonTitle, previousLessons });

    res.status(202).json({
      success: true,
      data: { jobId },
      message: 'Lesson generation job started'
    });
  } catch (error) {
    console.error('Generate lesson error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to enqueue lesson generation'
    });
  }
};

