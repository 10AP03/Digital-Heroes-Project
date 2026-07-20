# Changelog

All notable changes to this project are documented in this file, grouped by development phase.

## Phase 3 — Deployment (Current)

### Added
- Production Postgres database provisioned via Supabase, replacing local dev database.
- Resume storage migrated from local disk to Vercel Blob (`public: 'access'`), since local filesystem writes do not persist on Vercel's serverless runtime.
- `prisma.config.ts` added to support Prisma 7's new datasource configuration model.
- `src/proxy.ts` added, replacing the deprecated `src/middleware.ts` convention (Next.js 16 renamed Middleware to Proxy).
- Candidate-facing roles page (`/candidate/roles`) now revalidates on role creation and on open/close toggling, so newly posted or updated roles appear without a stale cache.
- Full deployment to Vercel with GitHub integration for automatic deploys on push to `master`.

### Fixed
- Prisma Client import failures on Vercel builds caused by:
  - Missing `prisma generate` step in the `build` script.
  - Missing `@prisma/adapter-pg` and `pg` packages not declared as direct dependencies.
- Prisma schema validation errors from Prisma 7's removal of `url`/`directUrl` from `schema.prisma`'s `datasource` block (moved to `prisma.config.ts`).
- Vercel Blob upload failures caused by a placeholder token value accidentally left in `.env`.
- Git push failures caused by a missing `origin` remote (resolved by re-linking the GitHub repository).

## Phase 2 — Core Application Flow

### Added
- AI interview question generation via Groq.
- AI feedback generation based on candidate answers.
- Recruiter decision screen (approve/reject applications).
- End-to-end flow verified with real accounts: candidate applies → recruiter shortlists → questions generated → candidate answers → AI feedback generated → recruiter approves/rejects.
- Navigation audit across all pages; back-links added throughout.
- Auth-gating middleware blocking unauthenticated access to `/dashboard`, `/recruiter`, `/candidate`, `/interviews`.

### Fixed
- Un-awaited `params` on the interview completion page.
- Dashboard cards linking to dead routes.
- "View Interview" link disappearing after shortlisting (replaced with dynamic button label: Generate Questions / Awaiting Candidate / View Interview).
- Candidates previously had no way to browse open roles.

## Phase 1 — Foundation & Core CRUD

### Added
- Initial Next.js + TypeScript + Tailwind project setup.
- Prisma schema with core models: `User`, `Client`, `Role`, `Application`, `Interview`, `InterviewQuestion`, plus Auth.js models.
- Auth.js credentials-based authentication with bcrypt password hashing.
- Role-aware session (`session.user.role`) via extended NextAuth types.
- Client CRUD and Role CRUD (recruiter-facing).
- Candidate application flow, including resume upload (originally to local disk).
- Recruiter applications page with shortlist/reject actions.

### Fixed
- Dev environment file-lock crashes caused by running the project from inside a OneDrive-synced folder (moved project directory outside OneDrive).
- Missing NextAuth API route handler (`src/app/api/auth/[...nextauth]/route.ts`), causing `ClientFetchError`.
- Missing `SessionProvider` wrapper in the root layout.
- `UserRole` type mismatches in Auth.js callbacks.
