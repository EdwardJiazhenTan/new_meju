# Database Setup Guide

This guide will help you set up your PostgreSQL database with Neon for the Meju recipe management application.

## Prerequisites

- A Neon account (sign up at https://neon.tech)
- Node.js installed
- Project dependencies installed (`npm install`)

## Setup Steps

### 1. Create a Neon Database

1. Go to https://neon.tech and sign in
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your-neon-connection-string-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional, for Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Run Database Setup

Choose one of the following options:

#### Option A: Production/Neon (Recommended)
```bash
npm run db:setup
```

This will:
- Generate Prisma Client
- Run all migrations to set up your database schema

#### Option B: Development (Alternative)
```bash
npm run db:migrate:dev
```

This will:
- Generate Prisma Client
- Run migrations
- Prompt you to name the migration

#### Option C: Push Schema (Quick prototyping)
```bash
npm run db:push
```

This pushes the schema directly without creating migration files.

## Available Database Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Generate Client | `npm run db:generate` | Generates Prisma Client |
| Push Schema | `npm run db:push` | Pushes schema to database (dev only) |
| Deploy Migrations | `npm run db:migrate` | Runs migrations (production) |
| Dev Migrations | `npm run db:migrate:dev` | Creates and runs migrations (dev) |
| Database Studio | `npm run db:studio` | Opens Prisma Studio GUI |
| Full Setup | `npm run db:setup` | Generates client + runs migrations |

## Database Schema

Your database includes the following tables:

### Auth Tables (NextAuth.js)
- `User` - User accounts
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

### App Tables
- `Recipe` - Recipe storage with title, content (markdown), and labels

## Verifying Setup

1. **Check migrations:**
   ```bash
   npx prisma migrate status
   ```

2. **Browse your data:**
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio at http://localhost:5555

3. **Test connection:**
   Start your development server and try signing up:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000/signup

## Neon-Specific Tips

1. **Connection Pooling:** Neon provides connection pooling. For serverless deployments, use the pooled connection string.

2. **Free Tier Limits:**
   - 512 MB storage
   - 1 project
   - Auto-suspend after inactivity

3. **Production Setup:**
   - Use environment variables in your hosting platform (Vercel, Railway, etc.)
   - The `postinstall` script automatically runs `prisma generate` when you deploy

## Troubleshooting

### Migration Failed
```bash
# Reset migrations (CAUTION: destroys data)
npx prisma migrate reset

# Then run setup again
npm run db:setup
```

### Connection Timeout
- Verify your DATABASE_URL is correct
- Check if your Neon database is active (it may be suspended)
- Ensure SSL mode is included: `?sslmode=require`

### Prisma Client Not Generated
```bash
npm run db:generate
```

## Creating New Migrations

When you change the schema (`prisma/schema.prisma`):

```bash
# Development
npm run db:migrate:dev

# This will prompt you to name your migration
# Example: "add_recipe_tags"
```

## Deployment Checklist

- [ ] Set DATABASE_URL in production environment
- [ ] Set NEXTAUTH_SECRET in production environment
- [ ] Set NEXTAUTH_URL to your production domain
- [ ] Run `npm run db:migrate` or let the build process handle it
- [ ] Verify database connection in production logs
