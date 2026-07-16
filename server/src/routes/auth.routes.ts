/**
 * Authentication routes
 * Handles user signup and login
 */

import { Router } from 'express';
import { signup, login, getProfile, googleLogin } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { body } from 'express-validator';

const router = Router();

// Validation middleware
const signupValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/google', googleLogin);
router.get('/profile', authMiddleware, getProfile);

export default router;
