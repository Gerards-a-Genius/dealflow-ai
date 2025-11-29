import { prisma } from '@dealflow/database';
import { DashboardStats, LeadConversionMetrics } from '@dealflow/shared';

export async function getDashboardStats(agentId: string): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Lead statistics
  const [totalLeads, newLeads, qualifiedLeads, convertedLeads] = await Promise.all([
    prisma.lead.count({
      where: { agentId, deletedAt: null },
    }),
    prisma.lead.count({
      where: { agentId, status: 'NEW', deletedAt: null },
    }),
    prisma.lead.count({
      where: { agentId, status: 'QUALIFIED', deletedAt: null },
    }),
    prisma.lead.count({
      where: { agentId, status: 'CONVERTED', deletedAt: null },
    }),
  ]);

  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Transaction statistics
  const [totalTransactions, activeTransactions, closedTransactions] = await Promise.all([
    prisma.transaction.count({
      where: { agentId, deletedAt: null },
    }),
    prisma.transaction.count({
      where: {
        agentId,
        status: { in: ['LISTED', 'UNDER_CONTRACT', 'PENDING_CLOSING'] },
        deletedAt: null,
      },
    }),
    prisma.transaction.count({
      where: { agentId, status: 'CLOSED', deletedAt: null },
    }),
  ]);

  const closedTransactionsWithPrice = await prisma.transaction.aggregate({
    where: {
      agentId,
      status: 'CLOSED',
      deletedAt: null,
      salePrice: { not: null },
    },
    _sum: {
      salePrice: true,
    },
  });

  const totalValue = closedTransactionsWithPrice._sum.salePrice || 0;

  // Activity statistics
  const [todayActivities, weekActivities, upcomingShowings] = await Promise.all([
    prisma.activity.count({
      where: {
        performedBy: agentId,
        createdAt: { gte: todayStart },
      },
    }),
    prisma.activity.count({
      where: {
        performedBy: agentId,
        createdAt: { gte: weekStart },
      },
    }),
    prisma.showing.count({
      where: {
        client: { agentId },
        scheduledAt: { gte: now },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        deletedAt: null,
      },
    }),
  ]);

  return {
    leads: {
      total: totalLeads,
      new: newLeads,
      qualified: qualifiedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
    },
    transactions: {
      total: totalTransactions,
      active: activeTransactions,
      closed: closedTransactions,
      totalValue,
    },
    activities: {
      todayCount: todayActivities,
      weekCount: weekActivities,
      upcomingShowings,
    },
  };
}

export async function getLeadMetrics(agentId: string): Promise<LeadConversionMetrics> {
  // Get leads by source
  const leadsBySource = await prisma.lead.groupBy({
    by: ['source', 'status'],
    where: { agentId, deletedAt: null },
    _count: true,
  });

  const sourceMetrics = new Map<string, { total: number; converted: number }>();

  leadsBySource.forEach(item => {
    if (!sourceMetrics.has(item.source)) {
      sourceMetrics.set(item.source, { total: 0, converted: 0 });
    }
    const metrics = sourceMetrics.get(item.source)!;
    metrics.total += item._count;
    if (item.status === 'CONVERTED') {
      metrics.converted += item._count;
    }
  });

  const bySource = Array.from(sourceMetrics.entries()).map(([source, data]) => ({
    source,
    total: data.total,
    converted: data.converted,
    conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
  }));

  // Get leads by month (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const leadsByMonth = await prisma.$queryRaw<
    Array<{ month: string; leads: number; conversions: number }>
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
      COUNT(*)::int as leads,
      COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END)::int as conversions
    FROM "leads"
    WHERE "agentId" = ${agentId}
      AND "deletedAt" IS NULL
      AND "createdAt" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month DESC
  `;

  const byMonth = leadsByMonth.map(item => ({
    month: item.month,
    leads: item.leads,
    conversions: item.conversions,
  }));

  return {
    bySource,
    byMonth,
  };
}

export async function getTransactionMetrics(agentId: string) {
  // Get transactions by status
  const byStatus = await prisma.transaction.groupBy({
    by: ['status'],
    where: { agentId, deletedAt: null },
    _count: true,
    _sum: {
      listPrice: true,
      salePrice: true,
    },
  });

  const statusMetrics = byStatus.map(item => ({
    status: item.status,
    count: item._count,
    totalListPrice: item._sum.listPrice || 0,
    totalSalePrice: item._sum.salePrice || 0,
  }));

  // Get average days to close
  const closedTransactions = await prisma.transaction.findMany({
    where: {
      agentId,
      status: 'CLOSED',
      actualClosingDate: { not: null },
      deletedAt: null,
    },
    select: {
      createdAt: true,
      actualClosingDate: true,
    },
  });

  const avgDaysToClose =
    closedTransactions.length > 0
      ? closedTransactions.reduce((sum, t) => {
          const days = Math.floor(
            (t.actualClosingDate!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / closedTransactions.length
      : 0;

  // Get upcoming closings
  const upcomingClosings = await prisma.transaction.findMany({
    where: {
      agentId,
      closingDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
      },
      status: { in: ['UNDER_CONTRACT', 'PENDING_CLOSING'] },
      deletedAt: null,
    },
    select: {
      id: true,
      propertyAddress: true,
      closingDate: true,
      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      closingDate: 'asc',
    },
  });

  return {
    byStatus: statusMetrics,
    avgDaysToClose: Math.round(avgDaysToClose),
    upcomingClosings,
  };
}
