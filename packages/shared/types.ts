// ============================================================================
// USER TYPES
// ============================================================================

export interface UserPayload {
  id: string;
  email: string;
  role: 'AGENT' | 'CLIENT' | 'ADMIN';
  firstName: string;
  lastName: string;
}

export interface JWTPayload extends UserPayload {
  iat: number;
  exp: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// LEAD TYPES
// ============================================================================

export interface CreateLeadDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: 'WEBSITE' | 'ZILLOW' | 'REALTOR_COM' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OPEN_HOUSE' | 'MANUAL';
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  propertyType?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateLeadDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'ACTIVE' | 'NURTURE' | 'LOST' | 'CONVERTED';
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  propertyType?: string;
  preApproved?: boolean;
  notes?: string;
  tags?: string[];
}

export interface LeadFilters {
  status?: string[];
  source?: string[];
  minScore?: number;
  maxScore?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'score' | 'lastContactDate';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface CreateTransactionDto {
  clientId: string;
  leadId?: string;
  type: 'BUYER' | 'SELLER' | 'BOTH';
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyType: string;
  listPrice?: number;
  closingDate?: string;
}

export interface UpdateTransactionDto {
  status?: 'PRE_LISTING' | 'LISTED' | 'UNDER_CONTRACT' | 'PENDING_CLOSING' | 'CLOSED' | 'CANCELLED';
  listPrice?: number;
  salePrice?: number;
  listingDate?: string;
  offerDate?: string;
  inspectionDeadline?: string;
  appraisalDeadline?: string;
  financingDeadline?: string;
  closingDate?: string;
  notes?: string;
}

export interface UpdateMilestoneDto {
  offerAccepted?: boolean;
  inspectionComplete?: boolean;
  inspectionApproved?: boolean;
  appraisalComplete?: boolean;
  appraisalApproved?: boolean;
  loanApproved?: boolean;
  finalWalkthrough?: boolean;
}

export interface TransactionFilters {
  status?: string[];
  type?: string[];
  clientId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'closingDate';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface CreateDocumentDto {
  transactionId: string;
  name: string;
  type: 'OFFER' | 'INSPECTION_REPORT' | 'APPRAISAL' | 'LOAN_APPROVAL' | 'TITLE_REPORT' | 'DISCLOSURE' | 'CONTRACT' | 'ADDENDUM' | 'OTHER';
  url: string;
  size: number;
  mimeType: string;
  notes?: string;
}

export interface UpdateDocumentStatusDto {
  status: 'PENDING' | 'RECEIVED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

// ============================================================================
// SHOWING TYPES
// ============================================================================

export interface CreateShowingDto {
  transactionId?: string;
  clientId: string;
  propertyAddress: string;
  scheduledAt: string;
  duration?: number;
}

export interface UpdateShowingDto {
  scheduledAt?: string;
  duration?: number;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  clientFeedback?: string;
  clientRating?: number;
  agentNotes?: string;
}

// ============================================================================
// AI TYPES
// ============================================================================

export interface GenerateEmailDto {
  leadId?: string;
  transactionId?: string;
  context?: {
    occasion?: 'follow_up' | 'market_update' | 'showing_confirmation' | 'milestone_update' | 'custom';
    tone?: 'professional' | 'friendly' | 'urgent';
    additionalContext?: string;
  };
}

export interface ChatMessageDto {
  content: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  suggestions?: string[];
}

export interface GenerateMarketReportDto {
  location: {
    city: string;
    state: string;
    zip?: string;
  };
  propertyType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  leads: {
    total: number;
    new: number;
    qualified: number;
    conversionRate: number;
  };
  transactions: {
    total: number;
    active: number;
    closed: number;
    totalValue: number;
  };
  activities: {
    todayCount: number;
    weekCount: number;
    upcomingShowings: number;
  };
}

export interface LeadConversionMetrics {
  bySource: Array<{
    source: string;
    total: number;
    converted: number;
    conversionRate: number;
  }>;
  byMonth: Array<{
    month: string;
    leads: number;
    conversions: number;
  }>;
}
