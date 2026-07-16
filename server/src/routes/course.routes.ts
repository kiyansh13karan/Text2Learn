/**
 * Course management routes
 * CRUD operations for user courses
 */

import { Router } from 'express';
import {
  createCourse,
  getUserCourses,
  getCourse,
  deleteCourse,
  saveLesson,
  shareCourse,
  getSharedCourse,
  translateCourseToLanguage
} from '../controllers/course.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (no auth required)
router.get('/share/:shareId', getSharedCourse);

// Authenticated routes
router.use(authMiddleware);

router.post('/', createCourse);
router.get('/', getUserCourses);
router.get('/:id', getCourse);
router.delete('/:id', deleteCourse);
router.post('/:id/lessons', saveLesson);
router.post('/:id/share', shareCourse);
router.post('/:id/translate', translateCourseToLanguage);

export default router;
