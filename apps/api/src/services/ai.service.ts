import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@dealflow/database';
import { ApiError, GenerateEmailDto, ChatMessageDto, ChatResponse, GenerateMarketReportDto } from '@dealflow/shared';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-3-5-sonnet-20241022';

export async function generateEmail(userId: string, data: GenerateEmailDto) {
  let context = '';

  // Get lead context
  if (data.leadId) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: data.leadId,
        agentId: userId,
        deletedAt: null,
      },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!lead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND');
    }

    context = `
Lead Information:
- Name: ${lead.firstName} ${lead.lastName}
- Email: ${lead.email}
- Status: ${lead.status}
- Source: ${lead.source}
- Budget: ${lead.budgetMin ? `$${lead.budgetMin.toLocaleString()}` : 'Not specified'} - ${lead.budgetMax ? `$${lead.budgetMax.toLocaleString()}` : 'Not specified'}
- Timeline: ${lead.timeline || 'Not specified'}
- Property Type: ${lead.propertyType || 'Not specified'}
- Last Contact: ${lead.lastContactDate ? lead.lastContactDate.toLocaleDateString() : 'Never'}
- Score: ${lead.score}/100
- Recent Activities: ${lead.activities.map(a => `${a.type}: ${a.description}`).join(', ')}
`;
  }

  // Get transaction context
  if (data.transactionId) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: data.transactionId,
        agentId: userId,
        deletedAt: null,
      },
      include: {
        client: true,
      },
    });

    if (!transaction) {
      throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    context = `
Transaction Information:
- Client: ${transaction.client.firstName} ${transaction.client.lastName}
- Property: ${transaction.propertyAddress}, ${transaction.propertyCity}, ${transaction.propertyState}
- Type: ${transaction.type}
- Status: ${transaction.status}
- List Price: ${transaction.listPrice ? `$${transaction.listPrice.toLocaleString()}` : 'Not set'}
- Closing Date: ${transaction.closingDate ? transaction.closingDate.toLocaleDateString() : 'Not set'}
- Milestones:
  - Offer Accepted: ${transaction.offerAccepted ? 'Yes' : 'No'}
  - Inspection Complete: ${transaction.inspectionComplete ? 'Yes' : 'No'}
  - Appraisal Complete: ${transaction.appraisalComplete ? 'Yes' : 'No'}
  - Loan Approved: ${transaction.loanApproved ? 'Yes' : 'No'}
`;
  }

  const occasion = data.context?.occasion || 'follow_up';
  const tone = data.context?.tone || 'professional';
  const additionalContext = data.context?.additionalContext || '';

  const prompt = `You are a helpful assistant for a real estate agent. Generate a ${tone} email for a ${occasion} communication.

${context}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate a professional email that:
1. Has a compelling subject line
2. Is personalized based on the context
3. Provides value to the recipient
4. Has a clear call-to-action
5. Maintains a ${tone} tone

Return the response in the following JSON format:
{
  "subject": "Email subject line",
  "body": "Email body content"
}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new ApiError(500, 'Unexpected response from AI', 'AI_ERROR');
  }

  try {
    const result = JSON.parse(content.text);
    return result;
  } catch {
    // If not JSON, return as plain text
    return {
      subject: 'Follow-up',
      body: content.text,
    };
  }
}

export async function chat(userId: string, data: ChatMessageDto): Promise<ChatResponse> {
  // Get user's transaction context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      transactionsAsClient: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          agent: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Get conversation history
  const conversationId = data.conversationId || `conv_${Date.now()}`;
  const previousMessages = await prisma.message.findMany({
    where: {
      userId,
      metadata: {
        path: ['conversationId'],
        equals: conversationId,
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  const transaction = user.transactionsAsClient[0];
  const systemContext = transaction
    ? `You are a helpful AI assistant for a real estate client portal. You're helping ${user.firstName} ${user.lastName} with their ${transaction.type.toLowerCase()} transaction for ${transaction.propertyAddress}. Their agent is ${transaction.agent.firstName} ${transaction.agent.lastName} (${transaction.agent.email}, ${transaction.agent.phone}).

Current transaction status: ${transaction.status}
Property: ${transaction.propertyAddress}, ${transaction.propertyCity}, ${transaction.propertyState}

Answer questions about the real estate process, provide updates on their transaction, and help with general real estate questions. If you don't know something specific about their transaction, suggest they contact their agent.`
    : `You are a helpful AI assistant for a real estate client portal. You're helping ${user.firstName} ${user.lastName} with general real estate questions. Answer questions about the real estate process, home buying/selling tips, and provide helpful information.`;

  // Build conversation messages
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...previousMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: data.content,
    },
  ];

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemContext,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new ApiError(500, 'Unexpected response from AI', 'AI_ERROR');
  }

  const assistantMessage = content.text;

  // Save messages to database
  await prisma.message.createMany({
    data: [
      {
        userId,
        role: 'USER',
        content: data.content,
        metadata: { conversationId },
      },
      {
        userId,
        role: 'ASSISTANT',
        content: assistantMessage,
        metadata: { conversationId },
      },
    ],
  });

  return {
    message: assistantMessage,
    conversationId,
    suggestions: [
      'What are the next steps in my transaction?',
      'When is my closing date?',
      'How can I contact my agent?',
    ],
  };
}

export async function generateMarketReport(userId: string, data: GenerateMarketReportDto) {
  const prompt = `Generate a concise market report for ${data.location.city}, ${data.location.state}${data.location.zip ? ` ${data.location.zip}` : ''}.

${data.propertyType ? `Property Type: ${data.propertyType}` : ''}
${data.priceRange ? `Price Range: $${data.priceRange.min.toLocaleString()} - $${data.priceRange.max.toLocaleString()}` : ''}

Include:
1. Current market conditions (buyer's market vs seller's market)
2. Average home prices and trends
3. Days on market
4. Inventory levels
5. Key insights and recommendations

Note: Since you don't have access to real-time MLS data, provide general guidance based on typical market patterns and note that specific numbers should be verified with current MLS data.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new ApiError(500, 'Unexpected response from AI', 'AI_ERROR');
  }

  return {
    report: content.text,
    generatedAt: new Date().toISOString(),
    location: data.location,
  };
}

export async function analyzeLeadBehavior(userId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      agentId: userId,
      deletedAt: null,
    },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!lead) {
    throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND');
  }

  const prompt = `Analyze this real estate lead's behavior and provide insights:

Lead Details:
- Name: ${lead.firstName} ${lead.lastName}
- Status: ${lead.status}
- Score: ${lead.score}/100
- Source: ${lead.source}
- Budget: ${lead.budgetMin ? `$${lead.budgetMin.toLocaleString()}` : 'Not specified'} - ${lead.budgetMax ? `$${lead.budgetMax.toLocaleString()}` : 'Not specified'}
- Timeline: ${lead.timeline || 'Not specified'}
- Engagement:
  - Email Opened: ${lead.emailOpened ? 'Yes' : 'No'}
  - Link Clicked: ${lead.linkClicked ? 'Yes' : 'No'}
  - Replied: ${lead.repliedToAgent ? 'Yes' : 'No'}
- Last Contact: ${lead.lastContactDate ? lead.lastContactDate.toLocaleDateString() : 'Never'}
- Properties Viewed: ${lead.viewedProperties.length}

Recent Activities:
${lead.activities.slice(0, 10).map(a => `- ${a.type}: ${a.description} (${a.createdAt.toLocaleDateString()})`).join('\n')}

Provide:
1. Lead quality assessment (hot/warm/cold)
2. Recommended next steps
3. Communication strategy
4. Conversion likelihood
5. Red flags or concerns`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new ApiError(500, 'Unexpected response from AI', 'AI_ERROR');
  }

  return {
    analysis: content.text,
    leadScore: lead.score,
    analyzedAt: new Date().toISOString(),
  };
}
