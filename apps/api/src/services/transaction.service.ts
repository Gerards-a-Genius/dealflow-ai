import { prisma } from '@dealflow/database';
import { ApiError, CreateTransactionDto, UpdateTransactionDto, UpdateMilestoneDto, TransactionFilters } from '@dealflow/shared';

export async function getTransactions(userId: string, userRole: string, filters: TransactionFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
  };

  // Filter by role
  if (userRole === 'AGENT') {
    where.agentId = userId;
  } else if (userRole === 'CLIENT') {
    where.clientId = userId;
  }

  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status };
  }

  if (filters.type && filters.type.length > 0) {
    where.type = { in: filters.type };
  }

  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        documents: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createTransaction(agentId: string, data: CreateTransactionDto) {
  const transaction = await prisma.transaction.create({
    data: {
      agentId,
      clientId: data.clientId,
      leadId: data.leadId,
      type: data.type,
      propertyAddress: data.propertyAddress,
      propertyCity: data.propertyCity,
      propertyState: data.propertyState,
      propertyZip: data.propertyZip,
      propertyType: data.propertyType,
      listPrice: data.listPrice,
      closingDate: data.closingDate ? new Date(data.closingDate) : undefined,
    },
  });

  // Create default milestones
  const defaultMilestones = [
    { name: 'Offer Accepted', order: 1 },
    { name: 'Inspection', order: 2 },
    { name: 'Appraisal', order: 3 },
    { name: 'Financing Approval', order: 4 },
    { name: 'Final Walkthrough', order: 5 },
    { name: 'Closing', order: 6 },
  ];

  await prisma.milestone.createMany({
    data: defaultMilestones.map(m => ({
      transactionId: transaction.id,
      name: m.name,
      order: m.order,
    })),
  });

  // Log activity
  await prisma.activity.create({
    data: {
      transactionId: transaction.id,
      type: 'TRANSACTION_CREATED',
      description: `Transaction created for ${data.propertyAddress}`,
      performedBy: agentId,
    },
  });

  return transaction;
}

export async function getTransactionById(userId: string, userRole: string, transactionId: string) {
  const where: any = {
    id: transactionId,
    deletedAt: null,
  };

  if (userRole === 'AGENT') {
    where.agentId = userId;
  } else if (userRole === 'CLIENT') {
    where.clientId = userId;
  }

  const transaction = await prisma.transaction.findFirst({
    where,
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      milestones: {
        orderBy: { order: 'asc' },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          performer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
  }

  return transaction;
}

export async function updateTransaction(agentId: string, transactionId: string, data: UpdateTransactionDto) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, agentId, deletedAt: null },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...data,
      listingDate: data.listingDate ? new Date(data.listingDate) : undefined,
      offerDate: data.offerDate ? new Date(data.offerDate) : undefined,
      inspectionDeadline: data.inspectionDeadline ? new Date(data.inspectionDeadline) : undefined,
      appraisalDeadline: data.appraisalDeadline ? new Date(data.appraisalDeadline) : undefined,
      financingDeadline: data.financingDeadline ? new Date(data.financingDeadline) : undefined,
      closingDate: data.closingDate ? new Date(data.closingDate) : undefined,
      updatedAt: new Date(),
    },
  });

  // Log activity if status changed
  if (data.status && data.status !== transaction.status) {
    await prisma.activity.create({
      data: {
        transactionId: transaction.id,
        type: 'TRANSACTION_STATUS_CHANGED',
        description: `Transaction status changed from ${transaction.status} to ${data.status}`,
        performedBy: agentId,
      },
    });
  }

  return updated;
}

export async function updateMilestone(agentId: string, transactionId: string, data: UpdateMilestoneDto) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, agentId, deletedAt: null },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  // Log milestone completions
  const completedMilestones = Object.entries(data).filter(([key, value]) => value === true);
  for (const [milestone] of completedMilestones) {
    await prisma.activity.create({
      data: {
        transactionId: transaction.id,
        type: 'MILESTONE_COMPLETED',
        description: `Milestone completed: ${milestone}`,
        performedBy: agentId,
      },
    });
  }

  return updated;
}

export async function deleteTransaction(agentId: string, transactionId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, agentId, deletedAt: null },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { deletedAt: new Date() },
  });
}
