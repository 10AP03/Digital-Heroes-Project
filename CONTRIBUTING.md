# Contributing

This project was built as a trial task submission and is not currently accepting external contributions. That said, if you're reviewing the code and want to run it locally:

## Local Setup

1. Clone the repo and run `npm install`.
2. Copy `.env.example` to `.env` and fill in your own credentials (Supabase, Groq, Vercel Blob).
3. Run `npx prisma migrate deploy` to set up the database schema.
4. Run `npm run dev` to start the local dev server.

## Code Conventions

- Server Actions live in `src/server/actions/`, one file per resource (`roles.ts`, `applications.ts`, `decision.ts`, etc.).
- All database access goes through the shared Prisma client in `src/lib/prisma.ts`.
- Form validation uses Zod schemas in `src/lib/validators.ts`.
- Auth-gated Server Actions check `session.user.role` explicitly rather than relying solely on route-level middleware.

## Reporting Issues

Since this is a trial submission, please raise any issues directly with the project owner rather than opening a public issue.
