## Why

The ATS needs to persist candidate profiles (identity, education, work experience, and resume metadata) before any API or UI can manage them. Introducing the Candidate aggregate in the database now unblocks backend and frontend tickets that depend on this data model.

## What Changes

- Add four Prisma models: **Candidate**, **Education**, **WorkExperience**, **Resume**, with correct types, lengths, uniqueness, and relations.
- **Candidate** is the aggregate root; Education, WorkExperience, and Resume are child entities with `candidateId` foreign keys and cascade delete behaviour.
- One new migration: `add_candidate_aggregate`; no changes to the existing **User** model.
- No new REST endpoints, routes, services, or UI in this change.

## Capabilities

### New Capabilities
- `candidate-aggregate`: Persistence of the Candidate aggregate (Candidate, Education, WorkExperience, Resume) in the database via Prisma; schema and migration only, aligned with `ai-specs/specs/data-model.md` and API request shapes.

### Modified Capabilities
- (None; no existing openspec specs are changed.)

## Impact

- **Code**: `backend/prisma/schema.prisma` modified; one new migration directory under `backend/prisma/migrations/`.
- **APIs**: None (database-only).
- **Dependencies**: None new; PostgreSQL and Prisma unchanged.
- **Systems**: Database gains new tables; existing User table and migrations untouched.

## Non-goals

- No Application model or Candidate→Application relation in this change (deferred to when Position/InterviewFlow exist).
- No enforcement of "max 3 education records per candidate" in the DB; that rule is for the application layer in a later ticket.
- No new backend routes, controllers, services, or repositories.
