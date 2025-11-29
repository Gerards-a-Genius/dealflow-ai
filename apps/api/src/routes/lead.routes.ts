import { Router } from 'express';
import { authenticate, requireAgent } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createLeadSchema, updateLeadSchema } from '@dealflow/shared';
import * as leadService from '../services/lead.service';

const router = Router();

// All lead routes require authentication
router.use(authenticate);
router.use(requireAgent);

// GET /api/leads - List all leads with filters
router.get('/', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const filters = {
      status: req.query.status as string[] | undefined,
      source: req.query.source as string[] | undefined,
      minScore: req.query.minScore ? parseInt(req.query.minScore as string) : undefined,
      maxScore: req.query.maxScore ? parseInt(req.query.maxScore as string) : undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: (req.query.sortBy as any) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await leadService.getLeads(agentId, filters);
    res.json({
      success: true,
      data: result.leads,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads - Create new lead
router.post('/', validate(createLeadSchema), async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const lead = await leadService.createLead(agentId, req.body);
    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/leads/:id - Get lead details
router.get('/:id', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const lead = await leadService.getLeadById(agentId, req.params.id);
    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/leads/:id - Update lead
router.patch('/:id', validate(updateLeadSchema), async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const lead = await leadService.updateLead(agentId, req.params.id, req.body);
    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/leads/:id - Soft delete lead
router.delete('/:id', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    await leadService.deleteLead(agentId, req.params.id);
    res.json({
      success: true,
      data: { message: 'Lead deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/:id/score - Recalculate lead score
router.post('/:id/score', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const lead = await leadService.recalculateLeadScore(agentId, req.params.id);
    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/:id/convert - Convert lead to transaction
router.post('/:id/convert', async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const transaction = await leadService.convertLeadToTransaction(agentId, req.params.id, req.body);
    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
