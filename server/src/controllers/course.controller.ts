/**
 * Course Controller
 * Handles CRUD operations for courses
 */

import { Response, Request } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { translateCourse } from '../services/gemini.service';
import { randomBytes } from 'crypto';

/**
 * Create a new course
 */
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { title, description, outline } = req.body;

    // Validate request body
    if (!title || !description || !outline) {
      console.error('❌ Validation failed:', { title: !!title, description: !!description, outline: !!outline });
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, or outline'
      });
      return;
    }

    console.log('📝 Creating course:');
    console.log('  - User ID:', req.user.userId);
    console.log('  - Title:', title);
    console.log('  - Description:', description.substring(0, 50) + '...');
    console.log('  - Outline modules:', outline.modules?.length || 0);

    // Create course without optional fields to ensure compatibility with all database states
    // This works whether the database has the language/shareId columns or not
    const course = await prisma.course.create({
      data: {
        userId: req.user.userId,
        title,
        description,
        outline
        // Note: language and shareId are optional in schema
        // They will default to null if columns exist, or be ignored if they don't
      }
    });

    console.log('✅ Course created successfully:', course.id);

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error: any) {
    console.error('❌ Create course error:');
    console.error('  - Error name:', error.name);
    console.error('  - Error code:', error.code);
    console.error('  - Error message:', error.message);
    
    // Log detailed Prisma error metadata
    if (error.meta) {
      console.error('  - Error meta:', JSON.stringify(error.meta, null, 2));
      console.error('  - Missing column:', error.meta.column);
      console.error('  - Table:', error.meta.table || error.meta.modelName);
    }
    
    console.error('  - Full error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2022') {
      const missingColumn = error.meta?.column || 'unknown';
      const tableName = error.meta?.table || error.meta?.modelName || 'unknown';
      
      console.error(`\n🚨 DATABASE SCHEMA MISMATCH DETECTED:`);
      console.error(`   Table: ${tableName}`);
      console.error(`   Missing column: ${missingColumn}`);
      console.error(`   \n   FIX: Run this SQL on your database:`);
      console.error(`   ALTER TABLE ${tableName.toLowerCase()} ADD COLUMN IF NOT EXISTS "${missingColumn}" VARCHAR(255);\n`);
      
      res.status(500).json({
        success: false,
        message: `Database schema error: Column "${missingColumn}" does not exist in table "${tableName}"`,
        error: 'Please run database migrations. See server logs for SQL fix.',
        details: {
          code: error.code,
          column: missingColumn,
          table: tableName,
          fix: `Run: npx prisma migrate deploy (production) or see FIX_DATABASE_SCHEMA.md`
        }
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

/**
 * Get all courses for authenticated user with optional search
 */
export const getUserCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { q } = req.query;
    const searchQuery = q ? String(q) : '';

    const courses = await prisma.course.findMany({
      where: {
        userId: req.user.userId,
        ...(searchQuery && {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
};

/**
 * Get a specific course with all lessons
 */
export const getCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const course = await prisma.course.findFirst({
      where: {
        id,
        userId: req.user.userId
      },
      include: {
        lessons: {
          orderBy: [
            { moduleIndex: 'asc' },
            { lessonIndex: 'asc' }
          ]
        }
      }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course'
    });
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Verify ownership
    const course = await prisma.course.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Delete course and all associated lessons (cascade)
    await prisma.course.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
};

/**
 * Save a generated lesson to a course
 */
export const saveLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id: courseId } = req.params;
    const { moduleIndex, lessonIndex, title, content } = req.body;

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId: req.user.userId
      }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check if lesson already exists
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        courseId,
        moduleIndex,
        lessonIndex
      }
    });

    let lesson;
    if (existingLesson) {
      // Update existing lesson
      lesson = await prisma.lesson.update({
        where: { id: existingLesson.id },
        data: { title, content }
      });
    } else {
      // Create new lesson
      lesson = await prisma.lesson.create({
        data: {
          courseId,
          moduleIndex,
          lessonIndex,
          title,
          content
        }
      });
    }

    res.status(200).json({
      success: true,
      data: lesson,
      message: 'Lesson saved successfully'
    });
  } catch (error) {
    console.error('Save lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save lesson'
    });
  }
};

/**
 * Generate a public share link for a course
 */
export const shareCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Generate unique shareId if not exists
    let shareId = course.shareId;
    if (!shareId) {
      shareId = randomBytes(16).toString('hex');
      await prisma.course.update({
        where: { id },
        data: { shareId }
      });
    }

    res.status(200).json({
      success: true,
      data: { shareId },
      message: 'Share link generated successfully'
    });
  } catch (error) {
    console.error('Share course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share link'
    });
  }
};

/**
 * Get a shared course by shareId (public, no auth required)
 */
export const getSharedCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;

    const course = await prisma.course.findUnique({
      where: { shareId },
      include: {
        lessons: {
          orderBy: [
            { moduleIndex: 'asc' },
            { lessonIndex: 'asc' }
          ]
        }
      }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Shared course not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get shared course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared course'
    });
  }
};

/**
 * Translate a course to another language
 * TEMPORARILY DISABLED: Requires language column in database
 */
export const translateCourseToLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { language } = req.query;

    if (!language || typeof language !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Language parameter is required'
      });
      return;
    }

    // Validate language
    const supportedLanguages = ['en', 'hi', 'es', 'fr', 'de'];
    if (!supportedLanguages.includes(language)) {
      res.status(400).json({
        success: false,
        message: 'Unsupported language. Supported: en, hi, es, fr, de'
      });
      return;
    }

    // Get original course
    const course = await prisma.course.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Translate course outline using Gemini
    console.log(`📝 Translating course to ${language}...`);
    const translatedOutline = await translateCourse(course.outline, language);

    // Update course with translated content
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title: translatedOutline.title || course.title,
        description: translatedOutline.description || course.description,
        outline: translatedOutline,
        language: language
      }
    });

    console.log(`✅ Course translated successfully to ${language}`);

    res.status(200).json({
      success: true,
      data: updatedCourse,
      message: 'Course translated successfully'
    });
  } catch (error) {
    console.error('❌ Translate course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to translate course'
    });
  }
};
