import { Router } from 'express';
import { authenticate, requireAgent } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTransactionSchema, updateTransactionSchema, updateMilestoneSchema } from '@dealflow/shared';
import * as transactionService from '../services/transaction.service';
import * as documentService from '../services/document.service';

const router = Router();

router.use(authenticate);

// GET /api/transactions - List transactions
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const filters = {
      status: req.query.status as string[] | undefined,
      type: req.query.type as string[] | undefined,
      clientId: req.query.clientId as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: (req.query.sortBy as any) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await transactionService.getTransactions(userId, userRole, filters);
    res.json({
      success: true,
      data: result.transactions,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions - Create transaction (agent only)
router.post('/', requireAgent, validate(createTransactionSchema), async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const transaction = await transactionService.createTransaction(agentId, req.body);
    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/:id - Get transaction details
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const transaction = await transactionService.getTransactionById(userId, userRole, req.params.id);
    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/transactions/:id - Update transaction (agent only)
router.patch('/:id', requireAgent, validate(updateTransactionSchema), async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const transaction = await transactionService.updateTransaction(agentId, req.params.id, req.body);
    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/transactions/:id/milestone - Update milestone
router.patch('/:id/milestone', requireAgent, validate(updateMilestoneSchema), async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    const transaction = await transactionService.updateMilestone(agentId, req.params.id, req.body);
    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/transactions/:id - Soft delete transaction (agent only)
router.delete('/:id', requireAgent, async (req, res, next) => {
  try {
    const agentId = req.user!.id;
    await transactionService.deleteTransaction(agentId, req.params.id);
    res.json({
      success: true,
      data: { message: 'Transaction deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// Document routes
// GET /api/transactions/:id/documents - List documents
router.get('/:id/documents', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const documents = await documentService.getDocuments(userId, userRole, req.params.id);
    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions/:id/documents - Upload document
router.post('/:id/documents', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const document = await documentService.createDocument(userId, req.params.id, req.body);
    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
