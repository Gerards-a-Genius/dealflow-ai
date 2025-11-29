import { prisma } from '@dealflow/database';
import { ApiError, CreateDocumentDto, UpdateDocumentStatusDto } from '@dealflow/shared';

export async function getDocuments(userId: string, userRole: string, transactionId: string) {
  // Verify user has access to this transaction
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      deletedAt: null,
      ...(userRole === 'AGENT' ? { agentId: userId } : { clientId: userId }),
    },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
  }

  const documents = await prisma.document.findMany({
    where: {
      transactionId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  return documents;
}

export async function createDocument(userId: string, transactionId: string, data: CreateDocumentDto) {
  // Verify user has access to this transaction
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      deletedAt: null,
      OR: [
        { agentId: userId },
        { clientId: userId },
      ],
    },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
  }

  const document = await prisma.document.create({
    data: {
      transactionId,
      name: data.name,
      type: data.type,
      url: data.url,
      uploadedBy: userId,
      size: data.size,
      mimeType: data.mimeType,
      notes: data.notes,
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      transactionId,
      type: 'DOCUMENT_UPLOADED',
      description: `Document uploaded: ${data.name}`,
      performedBy: userId,
    },
  });

  return document;
}

export async function updateDocumentStatus(
  userId: string,
  documentId: string,
  data: UpdateDocumentStatusDto
) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, deletedAt: null },
    include: {
      transaction: {
        select: {
          agentId: true,
        },
      },
    },
  });

  if (!document) {
    throw new ApiError(404, 'Document not found', 'DOCUMENT_NOT_FOUND');
  }

  // Only agent can update document status
  if (document.transaction.agentId !== userId) {
    throw new ApiError(403, 'Only the agent can update document status', 'FORBIDDEN');
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      status: data.status,
      notes: data.notes,
      updatedAt: new Date(),
    },
  });

  return updated;
}

export async function deleteDocument(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, deletedAt: null },
    include: {
      transaction: {
        select: {
          agentId: true,
        },
      },
    },
  });

  if (!document) {
    throw new ApiError(404, 'Document not found', 'DOCUMENT_NOT_FOUND');
  }

  // Only agent or uploader can delete
  if (document.transaction.agentId !== userId && document.uploadedBy !== userId) {
    throw new ApiError(403, 'You cannot delete this document', 'FORBIDDEN');
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { deletedAt: new Date() },
  });
}
