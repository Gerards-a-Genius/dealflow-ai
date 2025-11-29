import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createShowingSchema, updateShowingSchema } from '@dealflow/shared';
import * as showingService from '../services/showing.service';

const router = Router();

router.use(authenticate);

// GET /api/showings - List showings
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const showings = await showingService.getShowings(userId, userRole);
    res.json({
      success: true,
      data: showings,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/showings - Schedule showing
router.post('/', validate(createShowingSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const showing = await showingService.createShowing(userId, req.body);
    res.status(201).json({
      success: true,
      data: showing,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/showings/:id - Get showing details
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const showing = await showingService.getShowingById(userId, userRole, req.params.id);
    res.json({
      success: true,
      data: showing,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/showings/:id - Update showing
router.patch('/:id', validate(updateShowingSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const showing = await showingService.updateShowing(userId, req.params.id, req.body);
    res.json({
      success: true,
      data: showing,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/showings/:id - Cancel showing
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    await showingService.deleteShowing(userId, req.params.id);
    res.json({
      success: true,
      data: { message: 'Showing cancelled successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/showings/:id/feedback - Submit feedback
router.post('/:id/feedback', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const showing = await showingService.submitFeedback(userId, req.params.id, req.body);
    res.json({
      success: true,
      data: showing,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
