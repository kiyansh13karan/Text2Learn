/**
 * Shared TypeScript types and interfaces for Text2Learn
 */

import { Request } from 'express';

// ============================================
// Authentication Types
// ============================================

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

// ============================================
// Course Structure Types
// ============================================

export interface CourseModule {
  title: string;
  description?: string;
  lessons: string[];
}

export interface CourseOutline {
  title: string;
  description: string;
  modules: CourseModule[];
}

// ============================================
// Lesson Content Types
// ============================================

export type ContentBlockType = 'heading' | 'paragraph' | 'code' | 'list' | 'video' | 'mcq';

export interface BaseContentBlock {
  type: ContentBlockType;
}

export interface HeadingBlock extends BaseContentBlock {
  type: 'heading';
  text: string;
  level?: 1 | 2 | 3;
}

export interface ParagraphBlock extends BaseContentBlock {
  type: 'paragraph';
  text: string;
}

export interface CodeBlock extends BaseContentBlock {
  type: 'code';
  language: string;
  text: string;
}

export interface ListBlock extends BaseContentBlock {
  type: 'list';
  items: string[];
  ordered?: boolean;
}

export interface VideoBlock extends BaseContentBlock {
  type: 'video';
  query: string;
  videoId?: string;
  title?: string;
  thumbnail?: string;
}

export interface MCQOption {
  text: string;
  isCorrect: boolean;
}

export interface MCQBlock extends BaseContentBlock {
  type: 'mcq';
  question: string;
  options: MCQOption[];
  explanation?: string;
}

export type ContentBlock = 
  | HeadingBlock 
  | ParagraphBlock 
  | CodeBlock 
  | ListBlock 
  | VideoBlock 
  | MCQBlock;

export interface LessonContent {
  title: string;
  objectives: string[];
  content: ContentBlock[];
  estimatedMinutes?: number;
}

// ============================================
// YouTube Types
// ============================================

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface GenerateCourseRequest {
  topic: string;
  moduleCount?: number;
  lessonCount?: number;
}

export interface GenerateLessonRequest {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  previousLessons?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// Database Types (will match Prisma schema)
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  userId: string;
  title: string;
  description: string;
  outline: CourseOutline;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleIndex: number;
  lessonIndex: number;
  title: string;
  content: LessonContent;
  createdAt: Date;
  updatedAt: Date;
}
