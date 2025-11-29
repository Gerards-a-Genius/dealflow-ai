# DealFlow AI - Quick Start Guide

## What We've Built

**DealFlow AI** is an AI-powered real estate automation platform with:
- **Agent Dashboard**: Manage leads, track transactions, AI-powered automation
- **Client Portal**: Real-time transaction visibility, showing scheduler, 24/7 AI chatbot
- **Full-stack Architecture**: Next.js + Express + PostgreSQL + Anthropic Claude

## Current Status

✅ **Complete:**
- Full database schema (Prisma)
- Shared utilities & type system
- API authentication system
- Core middleware (auth, validation, errors)
- Project structure & configuration

🚧 **In Progress:**
- API routes for leads, transactions, AI

📋 **To Do:**
- Frontend (Next.js app)
- External integrations
- Deployment

## Project Structure

```
dealflow-ai/
├── apps/
│   ├── api/          ✅ Express API (auth complete, routes pending)
│   └── web/          ❌ Next.js frontend (not started)
├── packages/
│   ├── database/     ✅ Prisma schema with 8+ models
│   └── shared/       ✅ Types, validators, utilities
└── docs/             ✅ Architecture & planning docs
```

## How to Continue Development

### Prerequisites to Install

**You'll need to install these first:**

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - This gives you `npm` and `npx` commands

2. **PostgreSQL 15+**
   - Mac: `brew install postgresql@15` or download from https://www.postgresql.org/
   - Windows: Download installer from https://www.postgresql.org/
   - Linux: `sudo apt install postgresql-15`

3. **Anthropic API Key**
   - Sign up: https://www.anthropic.com/
   - Get API key from console

### Once Node.js is Installed

```bash
# Navigate to project
cd /Users/gerardmartelly/Downloads/Private\ \&\ Shared\ 12/dealflow-ai

# Install all dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env

# Edit .env file with your credentials:
nano apps/api/.env
# Update these values:
#   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dealflow_ai"
#   JWT_SECRET="your-secret-key"
#   ANTHROPIC_API_KEY="your-anthropic-key"

# Create database
createdb dealflow_ai

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

The API will run on `http://localhost:4000`

## Next Development Steps

### Option 1: Complete the API Backend (Recommended First)

**Focus:** Finish all API routes and services

```bash
# You need to create:
apps/api/src/routes/lead.routes.ts
apps/api/src/routes/transaction.routes.ts
apps/api/src/routes/showing.routes.ts
apps/api/src/routes/ai.routes.ts
apps/api/src/routes/analytics.routes.ts

apps/api/src/services/lead.service.ts
apps/api/src/services/transaction.service.ts
apps/api/src/services/showing.service.ts
apps/api/src/services/ai.service.ts
apps/api/src/services/analytics.service.ts
```

**Priority:**
1. Lead management (CRUD + scoring)
2. Transaction management (pipeline + milestones)
3. AI service (Claude integration for email generation, chat)
4. Analytics (dashboard stats)

### Option 2: Build the Frontend

**Focus:** Create the Next.js application

```bash
# Initialize Next.js app
cd apps
npx create-next-app@latest web --typescript --tailwind --app

# Install UI components
cd web
npx shadcn-ui@latest init
```

Then build:
1. Authentication pages (login/register)
2. Agent dashboard layout
3. Lead management UI
4. Transaction pipeline UI
5. Client portal

### Option 3: Test the API (Quick Win)

**Focus:** Test what's already built

```bash
# Start the API server
npm run dev

# In another terminal, test endpoints:

# Register a new agent
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'

# Get current user (use token from login response)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Development Workflow

1. **Before each session:** Review dev docs
   ```bash
   cat ~/dev/active/dealflow-ai/dealflow-context.md
   cat ~/dev/active/dealflow-ai/dealflow-tasks.md
   ```

2. **During development:** Update context
   ```bash
   # Mark tasks complete in dealflow-tasks.md
   # Add decisions to dealflow-context.md
   ```

3. **Before stopping:** Save progress
   ```bash
   # Update PROGRESS.md with what you completed
   # Commit to git (if initialized)
   ```

## Architecture Reference

### Database Models
- **User**: Agents and clients with role-based access
- **Lead**: Potential clients with engagement scoring
- **Transaction**: Active deals with milestone tracking
- **Document**: Contract, reports, disclosures
- **Showing**: Property viewings with feedback
- **Message**: AI chatbot conversation history
- **Activity**: Audit trail of all actions

### API Endpoints (Planned)

```
Auth:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me

Leads:
  GET    /api/leads
  POST   /api/leads
  GET    /api/leads/:id
  PATCH  /api/leads/:id
  POST   /api/leads/:id/score
  POST   /api/leads/:id/convert

Transactions:
  GET    /api/transactions
  POST   /api/transactions
  GET    /api/transactions/:id
  PATCH  /api/transactions/:id
  PATCH  /api/transactions/:id/milestone

AI:
  POST   /api/ai/generate-email
  POST   /api/ai/chat
  POST   /api/ai/market-report

Analytics:
  GET    /api/analytics/dashboard
```

## Key Features to Build

### Agent Dashboard
1. **Lead Management**
   - List view with filters (status, source, score)
   - Kanban board (New → Contacted → Qualified → Active)
   - Lead detail with activity timeline
   - AI-powered lead scoring

2. **Transaction Pipeline**
   - Visual pipeline (Pre-listing → Listed → Under Contract → Closed)
   - Milestone tracker with deadlines
   - Document requests and tracking

3. **AI Tools**
   - Email template generator
   - Market report generator
   - Follow-up sequence builder

### Client Portal
1. **Transaction Dashboard**
   - Progress timeline with milestones
   - Document upload interface
   - Key dates and deadlines

2. **Showing Scheduler**
   - Calendar view with available slots
   - Self-service booking
   - Automatic confirmations

3. **AI Chatbot**
   - 24/7 question answering
   - Real estate FAQ
   - Escalation to agent

## Documentation

- **Architecture**: `/Users/gerardmartelly/dev/active/dealflow-ai/dealflow-context.md`
- **Implementation Plan**: `/Users/gerardmartelly/dev/active/dealflow-ai/dealflow-plan.md`
- **Task List**: `/Users/gerardmartelly/dev/active/dealflow-ai/dealflow-tasks.md`
- **Progress**: `./PROGRESS.md`

## Need Help?

1. Review the architecture docs in `~/dev/active/dealflow-ai/`
2. Check the database schema in `packages/database/schema.prisma`
3. Look at existing code in `apps/api/src/` for patterns
4. Reference the shared types in `packages/shared/types.ts`

## What Makes This Special

**DealFlow AI differentiates by:**
1. **Client-first design**: Most RE software focuses on agents, we delight clients
2. **AI-powered automation**: Claude handles routine communication
3. **Transparency**: Clients see real-time progress like tracking a package
4. **Modern UX**: Beautiful, responsive, mobile-first design

## Estimated Timeline

- Complete API: 4-6 hours
- Build Frontend: 8-10 hours
- Integrations: 2-3 hours
- Testing & Deploy: 2-3 hours

**Total to MVP: 16-22 hours**

---

**Ready to build the future of real estate technology!** 🏠🚀
