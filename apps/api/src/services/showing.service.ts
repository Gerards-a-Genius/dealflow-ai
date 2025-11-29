import { prisma } from '@dealflow/database';
import { ApiError, CreateShowingDto, UpdateShowingDto } from '@dealflow/shared';

export async function getShowings(userId: string, userRole: string) {
  const where: any = { deletedAt: null };

  if (userRole === 'CLIENT') {
    where.clientId = userId;
  } else if (userRole === 'AGENT') {
    // Agent sees showings for all their clients
    where.client = { agentId: userId };
  }

  const showings = await prisma.showing.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
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
      transaction: {
        select: {
          id: true,
          propertyAddress: true,
        },
      },
    },
  });

  return showings;
}

export async function createShowing(userId: string, data: CreateShowingDto) {
  const showing = await prisma.showing.create({
    data: {
      transactionId: data.transactionId,
      clientId: data.clientId,
      propertyAddress: data.propertyAddress,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration || 30,
    },
  });

  // Log activity
  if (data.transactionId) {
    await prisma.activity.create({
      data: {
        transactionId: data.transactionId,
        type: 'SHOWING_SCHEDULED',
        description: `Showing scheduled at ${data.propertyAddress} for ${new Date(data.scheduledAt).toLocaleString()}`,
        performedBy: userId,
      },
    });
  }

  return showing;
}

export async function getShowingById(userId: string, userRole: string, showingId: string) {
  const where: any = { id: showingId, deletedAt: null };

  if (userRole === 'CLIENT') {
    where.clientId = userId;
  } else if (userRole === 'AGENT') {
    where.client = { agentId: userId };
  }

  const showing = await prisma.showing.findFirst({
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
      transaction: {
        select: {
          id: true,
          propertyAddress: true,
        },
      },
    },
  });

  if (!showing) {
    throw new ApiError(404, 'Showing not found', 'SHOWING_NOT_FOUND');
  }

  return showing;
}

export async function updateShowing(userId: string, showingId: string, data: UpdateShowingDto) {
  const showing = await prisma.showing.findFirst({
    where: {
      id: showingId,
      deletedAt: null,
      OR: [
        { clientId: userId },
        { client: { agentId: userId } },
      ],
    },
  });

  if (!showing) {
    throw new ApiError(404, 'Showing not found', 'SHOWING_NOT_FOUND');
  }

  const updated = await prisma.showing.update({
    where: { id: showingId },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      updatedAt: new Date(),
    },
  });

  return updated;
}

export async function deleteShowing(userId: string, showingId: string) {
  const showing = await prisma.showing.findFirst({
    where: {
      id: showingId,
      deletedAt: null,
      OR: [
        { clientId: userId },
        { client: { agentId: userId } },
      ],
    },
  });

  if (!showing) {
    throw new ApiError(404, 'Showing not found', 'SHOWING_NOT_FOUND');
  }

  await prisma.showing.update({
    where: { id: showingId },
    data: { deletedAt: new Date(), status: 'CANCELLED' },
  });
}

export async function submitFeedback(
  userId: string,
  showingId: string,
  data: { clientFeedback?: string; clientRating?: number; agentNotes?: string }
) {
  const showing = await prisma.showing.findFirst({
    where: {
      id: showingId,
      deletedAt: null,
      OR: [
        { clientId: userId },
        { client: { agentId: userId } },
      ],
    },
  });

  if (!showing) {
    throw new ApiError(404, 'Showing not found', 'SHOWING_NOT_FOUND');
  }

  const updated = await prisma.showing.update({
    where: { id: showingId },
    data: {
      clientFeedback: data.clientFeedback,
      clientRating: data.clientRating,
      agentNotes: data.agentNotes,
      status: 'COMPLETED',
      updatedAt: new Date(),
    },
  });

  return updated;
}
