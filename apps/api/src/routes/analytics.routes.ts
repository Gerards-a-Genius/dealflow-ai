import { Router } from 'express';
import { authenticate, requireAgent } from '../middleware/auth.middleware';
import * as analyticsService from '../services/analytics.service';

const router = Router();

router.use(authenticate);
router.use(requireAgent);

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const stats = await analyticsService.getDashboardStats(agentId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/leads - Get lead conversion metrics
router.get('/leads', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const metrics = await analyticsService.getLeadMetrics(agentId);
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/transactions - Get transaction pipeline metrics
router.get('/transactions', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const metrics = await analyticsService.getTransactionMetrics(agentId);
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
