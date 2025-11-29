import { prisma } from '@dealflow/database';
import { ApiError, calculateLeadScore, CreateLeadDto, UpdateLeadDto, LeadFilters } from '@dealflow/shared';

export async function getLeads(agentId: string, filters: LeadFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    agentId,
    deletedAt: null,
  };

  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status };
  }

  if (filters.source && filters.source.length > 0) {
    where.source = { in: filters.source };
  }

  if (filters.minScore !== undefined || filters.maxScore !== undefined) {
    where.score = {};
    if (filters.minScore !== undefined) where.score.gte = filters.minScore;
    if (filters.maxScore !== undefined) where.score.lte = filters.maxScore;
  }

  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' },
      include: {
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createLead(agentId: string, data: CreateLeadDto) {
  const lead = await prisma.lead.create({
    data: {
      agentId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      source: data.source,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      timeline: data.timeline,
      propertyType: data.propertyType,
      notes: data.notes,
      tags: data.tags || [],
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: 'LEAD_CREATED',
      description: `Lead ${lead.firstName} ${lead.lastName} created`,
      performedBy: agentId,
    },
  });

  return lead;
}

export async function getLeadById(agentId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      agentId,
      deletedAt: null,
    },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        include: {
          performer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      transaction: true,
    },
  });

  if (!lead) {
    throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND');
  }

  return lead;
}

export async function updateLead(agentId: string, leadId: string, data: UpdateLeadDto) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, agentId, deletedAt: null },
  });

  if (!lead) {
    throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND');
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  // Log activity if status changed
  if (data.status && data.status !== lead.status) {
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'STATUS_CHANGED',
        description: `Lead status changed from ${lead.status} to ${data.status}`,
        performedBy: agentId,
      },
    });
  }

  return updated;
}

export async function deleteLead(agentId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, agentId, deletedAt: null },
  });

  if (!lead) {
    throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND');
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { deletedAt: new Date() },
  });
}

export async function recalculateLeadScore(agentId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, agentId, deletedAt: null },
  });

  if (!lead) {
    throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND');
  }

  const score = calculateLeadScore({
    emailOpened: lead.emailOpened,
    linkClicked: lead.linkClicked,
    repliedToAgent: lead.repliedToAgent,
    lastContactDate: lead.lastContactDate,
    budgetProvided: !!(lead.budgetMin || lead.budgetMax),
    timelineProvided: !!lead.timeline,
    preApproved: lead.preApproved,
    viewedPropertiesCount: lead.viewedProperties.length,
  });

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { score },
  });

  return updated;
}

export async function convertLeadToTransaction(
  agentId: string,
  leadId: string,
  transactionData: {
    type: 'BUYER' | 'SELLER' | 'BOTH';
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    propertyZip: string;
    propertyType: string;
    listPrice?: number;
  }
) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, agentId, deletedAt: null },
  });

  if (!lead) {
    throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND');
  }

  if (lead.status === 'CONVERTED') {
    throw new ApiError(400, 'Lead has already been converted', 'LEAD_ALREADY_CONVERTED');
  }

  // Create client account for the lead
  const client = await prisma.user.create({
    data: {
      email: lead.email,
      passwordHash: '', // Will be set when client first logs in
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      role: 'CLIENT',
      agentId,
    },
  });

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      agentId,
      clientId: client.id,
      leadId: lead.id,
      type: transactionData.type,
      propertyAddress: transactionData.propertyAddress,
      propertyCity: transactionData.propertyCity,
      propertyState: transactionData.propertyState,
      propertyZip: transactionData.propertyZip,
      propertyType: transactionData.propertyType,
      listPrice: transactionData.listPrice,
    },
  });

  // Update lead status
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: 'CONVERTED' },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      leadId: lead.id,
      transactionId: transaction.id,
      type: 'TRANSACTION_CREATED',
      description: `Lead converted to transaction`,
      performedBy: agentId,
    },
  });

  return transaction;
}
