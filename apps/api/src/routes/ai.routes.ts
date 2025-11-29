import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { generateEmailSchema, chatMessageSchema } from '@dealflow/shared';
import * as aiService from '../services/ai.service';

const router = Router();

router.use(authenticate);

// POST /api/ai/generate-email - Generate email template
router.post('/generate-email', validate(generateEmailSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const email = await aiService.generateEmail(userId, req.body);
    res.json({
      success: true,
      data: email,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/chat - Client portal chatbot
router.post('/chat', validate(chatMessageSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const response = await aiService.chat(userId, req.body);
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/market-report - Generate market report
router.post('/market-report', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const report = await aiService.generateMarketReport(userId, req.body);
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/analyze-lead - Analyze lead behavior
router.post('/analyze-lead/:leadId', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const analysis = await aiService.analyzeLeadBehavior(userId, req.params.leadId);
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
