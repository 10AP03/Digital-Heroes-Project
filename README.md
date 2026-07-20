# Digital Heroes — AI Interview Platform

An end-to-end recruiting platform where recruiters post roles, candidates apply and complete AI-generated interviews, and AI-assisted feedback helps recruiters make faster, more consistent hiring decisions.

**Live demo:** https://digital-heroes-project-ten.vercel.app

---

## Overview

The platform supports two roles:

- **Recruiters** create clients, post open roles, review applications, shortlist candidates, generate AI interview questions, review AI-generated feedback, and approve or reject applicants.
- **Candidates** browse open roles, apply with a resume upload, complete an AI-generated interview, and track their application status.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 (with `@prisma/adapter-pg` driver adapter) |
| Auth | Auth.js (NextAuth) with credentials + bcrypt |
| AI | Groq (question generation + feedback generation) |
| File storage | Vercel Blob (resume uploads) |
| Styling | Tailwind CSS |
| Hosting | Vercel |

## Core Flow

1. Recruiter registers, creates a Client, and posts a Role under that Client.
2. Candidate registers, browses open Roles, and applies with a PDF resume.
3. Recruiter reviews applications and shortlists candidates.
4. Recruiter generates AI interview questions for the shortlisted candidate.
5. Candidate completes the interview.
6. AI generates feedback based on the candidate's answers.
7. Recruiter reviews the feedback and approves or rejects the application.

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. a free [Supabase](https://supabase.com) project)
- A [Groq](https://console.groq.com) API key
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) read/write token

### Setup

```bash
git clone https://github.com/10AP03/Digital-Heroes-Project
cd Digital-Heroes-Project/my-project
npm install
```

Copy `.env.example` to `.env` and fill in real values (see [Environment Variables](#environment-variables) below).

```bash
npx prisma migrate deploy
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

See `.env.example` for the full list. Summary:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string (used at runtime) |
| `DIRECT_URL` | Direct (non-pooled) Postgres connection string (used for migrations) |
| `AUTH_SECRET` | Auth.js session encryption secret |
| `GROQ_API_KEY` | Groq API key for question/feedback generation |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for resume uploads |
| `NEXTAUTH_URL` | Base URL of the deployed app (used by Auth.js) |

## Deployment

This project is deployed on Vercel with GitHub integration — every push to `master` triggers an automatic deployment.

Key deployment notes for anyone redeploying or forking this project:

- **Prisma 7** requires connection URLs to live in `prisma.config.ts`, not in `schema.prisma`'s `datasource` block.
- The `build` script must run `prisma generate` before `next build`, since the generated client is not committed to Git.
- Resume files are stored via **Vercel Blob**, not local disk — local filesystem writes do not persist on Vercel's serverless runtime.
- Authentication route protection is implemented via `src/proxy.ts` (Next.js 16's replacement for the deprecated `middleware.ts` convention).

## Project Structure

```
src/
  app/                  # Next.js App Router pages and layouts
    auth.ts             # Full Auth.js config (Node runtime)
    auth.config.ts      # Edge-safe Auth.js config (used by proxy.ts)
  lib/
    prisma.ts           # Shared Prisma client (with adapter-pg)
    validators.ts       # Zod schemas
  server/
    actions/            # Server Actions (roles, applications, decisions, etc.)
  proxy.ts               # Route protection (auth gate)
prisma/
  schema.prisma
  migrations/
prisma.config.ts        # Prisma 7 datasource + migration config
```

## Known Limitations

- Route protection currently checks that a user is logged in, but does not yet enforce role-based access at the routing layer (e.g. a candidate account manually navigating to a recruiter URL is not blocked by `proxy.ts` — role checks are enforced within individual Server Actions).
- Voice-based interview answers are not implemented; candidates answer via typed text.

## License

See `LICENSE`.
