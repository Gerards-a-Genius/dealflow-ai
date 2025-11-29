import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo agent
  const agentPassword = await bcrypt.hash('demo123', 10);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@dealflow.ai' },
    update: {},
    create: {
      email: 'agent@dealflow.ai',
      passwordHash: agentPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(555) 123-4567',
      role: 'AGENT',
    },
  });

  console.log('Created demo agent:', agent.email);

  // Create demo clients
  const clientPassword = await bcrypt.hash('demo123', 10);
  const clients = await Promise.all([
    prisma.user.upsert({
      where: { email: 'client1@example.com' },
      update: {},
      create: {
        email: 'client1@example.com',
        passwordHash: clientPassword,
        firstName: 'John',
        lastName: 'Smith',
        phone: '(555) 234-5678',
        role: 'CLIENT',
        agentId: agent.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'client2@example.com' },
      update: {},
      create: {
        email: 'client2@example.com',
        passwordHash: clientPassword,
        firstName: 'Emily',
        lastName: 'Davis',
        phone: '(555) 345-6789',
        role: 'CLIENT',
        agentId: agent.id,
      },
    }),
  ]);

  console.log('Created demo clients');

  // Create demo leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        agentId: agent.id,
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        phone: '(555) 456-7890',
        source: 'WEBSITE',
        status: 'NEW',
        score: 65,
        budgetMin: 300000,
        budgetMax: 450000,
        timeline: '3-6 months',
        propertyType: 'Single Family',
        notes: 'Interested in suburban areas with good schools',
        tags: ['first-time-buyer', 'pre-approved'],
        emailOpened: true,
        linkClicked: true,
      },
    }),
    prisma.lead.create({
      data: {
        agentId: agent.id,
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jessica.martinez@example.com',
        phone: '(555) 567-8901',
        source: 'ZILLOW',
        status: 'QUALIFIED',
        score: 85,
        budgetMin: 500000,
        budgetMax: 700000,
        timeline: '1-3 months',
        propertyType: 'Condo',
        notes: 'Looking for downtown location, walkable to work',
        tags: ['investor', 'cash-buyer'],
        emailOpened: true,
        linkClicked: true,
        repliedToAgent: true,
        preApproved: true,
        viewedProperties: ['prop-123', 'prop-456'],
      },
    }),
    prisma.lead.create({
      data: {
        agentId: agent.id,
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        source: 'REFERRAL',
        status: 'ACTIVE',
        score: 90,
        budgetMin: 600000,
        budgetMax: 800000,
        timeline: 'Immediate',
        propertyType: 'Single Family',
        emailOpened: true,
        linkClicked: true,
        repliedToAgent: true,
        preApproved: true,
        viewedProperties: ['prop-789', 'prop-012', 'prop-345'],
      },
    }),
  ]);

  console.log('Created demo leads');

  // Create demo transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        agentId: agent.id,
        clientId: clients[0].id,
        type: 'BUYER',
        status: 'UNDER_CONTRACT',
        propertyAddress: '1234 Maple Street',
        propertyCity: 'San Francisco',
        propertyState: 'CA',
        propertyZip: '94102',
        propertyType: 'Single Family',
        listPrice: 850000,
        salePrice: 825000,
        offerDate: new Date('2024-11-15'),
        inspectionDeadline: new Date('2024-12-01'),
        appraisalDeadline: new Date('2024-12-05'),
        financingDeadline: new Date('2024-12-10'),
        closingDate: new Date('2024-12-20'),
        offerAccepted: true,
        inspectionComplete: true,
        inspectionApproved: true,
      },
    }),
    prisma.transaction.create({
      data: {
        agentId: agent.id,
        clientId: clients[1].id,
        type: 'SELLER',
        status: 'LISTED',
        propertyAddress: '5678 Oak Avenue',
        propertyCity: 'Oakland',
        propertyState: 'CA',
        propertyZip: '94601',
        propertyType: 'Condo',
        listPrice: 650000,
        listingDate: new Date('2024-11-20'),
      },
    }),
  ]);

  console.log('Created demo transactions');

  // Create demo milestones for first transaction
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Offer Accepted',
        description: 'Purchase offer accepted by seller',
        completed: true,
        completedAt: new Date('2024-11-15'),
        order: 1,
      },
    }),
    prisma.milestone.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Inspection',
        description: 'Home inspection completed',
        deadline: new Date('2024-12-01'),
        completed: true,
        completedAt: new Date('2024-11-25'),
        order: 2,
      },
    }),
    prisma.milestone.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Appraisal',
        description: 'Property appraisal',
        deadline: new Date('2024-12-05'),
        completed: false,
        order: 3,
      },
    }),
    prisma.milestone.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Financing Approval',
        description: 'Loan approval from lender',
        deadline: new Date('2024-12-10'),
        completed: false,
        order: 4,
      },
    }),
    prisma.milestone.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Final Walkthrough',
        description: 'Final property walkthrough',
        deadline: new Date('2024-12-19'),
        completed: false,
        order: 5,
      },
    }),
    prisma.milestone.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Closing',
        description: 'Transaction closing',
        deadline: new Date('2024-12-20'),
        completed: false,
        order: 6,
      },
    }),
  ]);

  console.log('Created demo milestones');

  // Create demo documents
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Purchase Agreement',
        type: 'CONTRACT',
        url: 'https://example.com/docs/purchase-agreement.pdf',
        uploadedBy: agent.id,
        status: 'APPROVED',
        size: 245000,
        mimeType: 'application/pdf',
      },
    }),
    prisma.document.create({
      data: {
        transactionId: transactions[0].id,
        name: 'Inspection Report',
        type: 'INSPECTION_REPORT',
        url: 'https://example.com/docs/inspection-report.pdf',
        uploadedBy: agent.id,
        status: 'REVIEWED',
        size: 1250000,
        mimeType: 'application/pdf',
        notes: 'Minor issues identified, all addressed',
      },
    }),
  ]);

  console.log('Created demo documents');

  // Create demo showings
  const showings = await Promise.all([
    prisma.showing.create({
      data: {
        transactionId: transactions[0].id,
        clientId: clients[0].id,
        propertyAddress: '1234 Maple Street, San Francisco, CA',
        scheduledAt: new Date('2024-11-10T14:00:00'),
        duration: 60,
        status: 'COMPLETED',
        clientFeedback: 'Love the kitchen and backyard! Great neighborhood.',
        clientRating: 5,
        agentNotes: 'Very interested, ready to make offer',
      },
    }),
    prisma.showing.create({
      data: {
        clientId: clients[1].id,
        propertyAddress: '9012 Pine Street, Berkeley, CA',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 30,
        status: 'SCHEDULED',
      },
    }),
  ]);

  console.log('Created demo showings');

  // Create demo activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        leadId: leads[0].id,
        type: 'LEAD_CREATED',
        description: 'Lead created from website inquiry',
        performedBy: agent.id,
      },
    }),
    prisma.activity.create({
      data: {
        leadId: leads[1].id,
        type: 'EMAIL_SENT',
        description: 'Sent welcome email with property recommendations',
        performedBy: agent.id,
      },
    }),
    prisma.activity.create({
      data: {
        transactionId: transactions[0].id,
        type: 'TRANSACTION_CREATED',
        description: 'Transaction created for 1234 Maple Street',
        performedBy: agent.id,
      },
    }),
    prisma.activity.create({
      data: {
        transactionId: transactions[0].id,
        type: 'MILESTONE_COMPLETED',
        description: 'Inspection completed successfully',
        performedBy: agent.id,
      },
    }),
  ]);

  console.log('Created demo activities');

  console.log('Database seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Agent: agent@dealflow.ai / demo123');
  console.log('Client 1: client1@example.com / demo123');
  console.log('Client 2: client2@example.com / demo123');
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
