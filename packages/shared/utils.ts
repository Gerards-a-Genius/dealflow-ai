// ============================================================================
// LEAD SCORING UTILITIES
// ============================================================================

export interface LeadScoringInputs {
  emailOpened: boolean;
  linkClicked: boolean;
  repliedToAgent: boolean;
  lastContactDate: Date | null;
  budgetProvided: boolean;
  timelineProvided: boolean;
  preApproved: boolean;
  viewedPropertiesCount: number;
}

export function calculateLeadScore(inputs: LeadScoringInputs): number {
  let score = 0;

  // Engagement scoring
  if (inputs.emailOpened) score += 10;
  if (inputs.linkClicked) score += 20;
  if (inputs.repliedToAgent) score += 30;
  if (inputs.viewedPropertiesCount > 0) score += inputs.viewedPropertiesCount * 5;

  // Recency scoring
  if (inputs.lastContactDate) {
    const daysSinceLastContact = Math.floor(
      (Date.now() - inputs.lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastContact < 7) score += 20;
    else if (daysSinceLastContact < 30) score += 10;
    else score -= 10;
  }

  // Intent indicators
  if (inputs.budgetProvided) score += 15;
  if (inputs.timelineProvided) score += 15;
  if (inputs.preApproved) score += 25;

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// TRANSACTION PROGRESS UTILITIES
// ============================================================================

export interface MilestoneData {
  offerAccepted: boolean;
  inspectionComplete: boolean;
  appraisalComplete: boolean;
  loanApproved: boolean;
  finalWalkthrough: boolean;
}

export function calculateTransactionProgress(milestones: MilestoneData): number {
  const total = 5;
  const completed = Object.values(milestones).filter(Boolean).length;
  return Math.round((completed / total) * 100);
}

export function getNextMilestone(milestones: MilestoneData): string | null {
  if (!milestones.offerAccepted) return 'Offer Acceptance';
  if (!milestones.inspectionComplete) return 'Inspection';
  if (!milestones.appraisalComplete) return 'Appraisal';
  if (!milestones.loanApproved) return 'Financing Approval';
  if (!milestones.finalWalkthrough) return 'Final Walkthrough';
  return null; // All milestones complete
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: Date | string): boolean {
  return getDaysUntil(date) < 0;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

export function isValidZipCode(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

// ============================================================================
// API UTILITIES
// ============================================================================

export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: { message: string; code?: string; details?: any },
  meta?: any
) {
  return {
    success,
    data,
    error,
    meta,
  };
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): { statusCode: number; message: string; code?: string } {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: 'An unexpected error occurred',
  };
}
