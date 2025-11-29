import { z } from 'zod';

// ============================================================================
// AUTH VALIDATORS
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// LEAD VALIDATORS
// ============================================================================

export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  source: z.enum(['WEBSITE', 'ZILLOW', 'REALTOR_COM', 'REFERRAL', 'SOCIAL_MEDIA', 'OPEN_HOUSE', 'MANUAL']),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.string().optional(),
  propertyType: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateLeadSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'ACTIVE', 'NURTURE', 'LOST', 'CONVERTED']).optional(),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.string().optional(),
  propertyType: z.string().optional(),
  preApproved: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// TRANSACTION VALIDATORS
// ============================================================================

export const createTransactionSchema = z.object({
  clientId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  type: z.enum(['BUYER', 'SELLER', 'BOTH']),
  propertyAddress: z.string().min(1, 'Property address is required'),
  propertyCity: z.string().min(1, 'City is required'),
  propertyState: z.string().length(2, 'State must be 2 characters'),
  propertyZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  propertyType: z.string().min(1, 'Property type is required'),
  listPrice: z.number().int().positive().optional(),
  closingDate: z.string().datetime().optional(),
});

export const updateTransactionSchema = z.object({
  status: z.enum(['PRE_LISTING', 'LISTED', 'UNDER_CONTRACT', 'PENDING_CLOSING', 'CLOSED', 'CANCELLED']).optional(),
  listPrice: z.number().int().positive().optional(),
  salePrice: z.number().int().positive().optional(),
  listingDate: z.string().datetime().optional(),
  offerDate: z.string().datetime().optional(),
  inspectionDeadline: z.string().datetime().optional(),
  appraisalDeadline: z.string().datetime().optional(),
  financingDeadline: z.string().datetime().optional(),
  closingDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateMilestoneSchema = z.object({
  offerAccepted: z.boolean().optional(),
  inspectionComplete: z.boolean().optional(),
  inspectionApproved: z.boolean().optional(),
  appraisalComplete: z.boolean().optional(),
  appraisalApproved: z.boolean().optional(),
  loanApproved: z.boolean().optional(),
  finalWalkthrough: z.boolean().optional(),
});

// ============================================================================
// SHOWING VALIDATORS
// ============================================================================

export const createShowingSchema = z.object({
  transactionId: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  propertyAddress: z.string().min(1, 'Property address is required'),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().positive().default(30),
});

export const updateShowingSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  clientFeedback: z.string().optional(),
  clientRating: z.number().int().min(1).max(5).optional(),
  agentNotes: z.string().optional(),
});

// ============================================================================
// AI VALIDATORS
// ============================================================================

export const generateEmailSchema = z.object({
  leadId: z.string().uuid().optional(),
  transactionId: z.string().uuid().optional(),
  context: z.object({
    occasion: z.enum(['follow_up', 'market_update', 'showing_confirmation', 'milestone_update', 'custom']).optional(),
    tone: z.enum(['professional', 'friendly', 'urgent']).optional(),
    additionalContext: z.string().optional(),
  }).optional(),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  conversationId: z.string().uuid().optional(),
});
