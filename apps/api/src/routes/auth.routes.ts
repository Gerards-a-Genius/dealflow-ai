import { Router } from 'express';
import { register, login, getCurrentUser } from '../services/auth.service';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '@dealflow/shared';

const router = Router();

// POST /api/auth/register - Register a new agent
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Login agent or client
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    const user = await getCurrentUser(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
