# DealFlow AI

AI-powered real estate automation platform that helps agents manage leads and transactions while dramatically improving client experience.

## Project Structure

```
dealflow-ai/
├── apps/
│   ├── web/          # Next.js frontend (Agent dashboard + Client portal)
│   └── api/          # Express.js REST API
├── packages/
│   ├── database/     # Prisma schema and client
│   ├── shared/       # Shared TypeScript types and utilities
│   └── ui/           # Shared UI components (shadcn/ui)
└── docs/             # Documentation
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15+
- **AI**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Auth**: JWT, bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd dealflow-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

4. Set up the database:
```bash
npm run db:push
```

5. Start development servers:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:4000`.

## Development

### Running the monorepo

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run lint` - Lint all apps
- `npm run test` - Run tests for all apps

### Database commands

- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Create a new migration
- `npm run db:push` - Push schema changes to database

## Features

### Agent Dashboard
- Lead management with AI-powered scoring
- Transaction pipeline visualization
- AI-assisted email generation
- Automated follow-up sequences
- Analytics and reporting

### Client Portal
- Real-time transaction progress tracking
- Self-service showing scheduler
- Document upload and status tracking
- 24/7 AI chatbot for questions

## Documentation

See the `/docs` directory for detailed documentation:
- [Architecture](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Database Schema](docs/schema.md)
- [Deployment Guide](docs/deployment.md)

## License

Proprietary - All rights reserved
