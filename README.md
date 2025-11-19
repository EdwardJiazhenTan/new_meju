# Meju - Menu Planning App

A menu planning application for storing recipes as markdown and generating meal plans with tag-based filtering.

## Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm or yarn

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd new_meju
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create `.env` file:
```bash
# Database
DATABASE_URL="postgresql://username@localhost:5432/meju_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up database
```bash
# Create database
psql postgres -c "CREATE DATABASE meju_db;"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Running Locally

Start development server:
```bash
npm run dev
```

Open http://localhost:3000

## Testing

Run tests:
```bash
npm test          # Watch mode
npm run test:run  # Run once
npm run test:ui   # Visual UI
```

## Project Structure

```
app/
├── api/
│   ├── auth/[...nextauth]/   # Authentication
│   └── recipes/              # Recipe CRUD endpoints
├── dashboard/                # User dashboard
├── login/                    # Login page
└── recipes/new/              # Create recipe

components/
└── RecipeForm.tsx            # Reusable form

lib/validations/
└── recipe.ts                 # Zod schemas

prisma/
├── schema.prisma             # Database schema
└── migrations/               # Migration files
```

## Database Schema

- User: User accounts and authentication
- Account: OAuth provider data
- Session: User sessions
- Recipe: Recipe data (title, markdown content, labels)

## Authentication

Currently supports:
- Google OAuth

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- PostgreSQL + Prisma
- NextAuth.js v4
- Zod validation
- Vitest
- Tailwind CSS
