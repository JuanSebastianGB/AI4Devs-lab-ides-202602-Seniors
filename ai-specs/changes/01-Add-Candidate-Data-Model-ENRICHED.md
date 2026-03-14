# Ticket #1 – Data model and persistence (Candidate aggregate) – Enriched User Story

Use this content to update the Jira ticket: paste the sections below into the ticket description, keeping ** [original] ** and ** [enhanced] ** as separate H2 headings. If the ticket was in "To refine", move it to "Pending refinement validation".

---

## [original]

**Feature:** Add Candidate to ATS  
**Goal:** Introduce the Candidate aggregate in the database so the app can persist candidates with education, work experience, and resume metadata. No API or UI in this ticket.

### Objective

Introduce the Candidate aggregate in the database so the app can persist candidates with education, work experience, and resume metadata. No API or UI in this ticket.

### Codebase impact

| Action  | Path |
|---------|------|
| Modify  | `backend/prisma/schema.prisma` |
| Create  | `backend/prisma/migrations/<timestamp>_add_candidate_aggregate/` (migration SQL) |

### Technical requirements

- **Prisma models** (aligned with `ai-specs/specs/data-model.md` and api-spec schemas):
  - **Candidate**: `id`, `firstName`, `lastName`, `email` (unique), `phone` (optional), `address` (optional); relations to `Education[]`, `WorkExperience[]`, `Resume[]`, `Application[]`.
  - **Education**: `id`, `candidateId`, `institution`, `title`, `startDate`, `endDate?`; relation to `Candidate`.
  - **WorkExperience**: `id`, `candidateId`, `company`, `position`, `description?`, `startDate`, `endDate?`; relation to `Candidate`.
  - **Resume**: `id`, `candidateId`, `filePath`, `fileType`, `uploadDate` (default `now()`); relation to `Candidate`.
- **Field constraints**: String lengths per spec (e.g. firstName/lastName 100, email 255, phone 15, address 100, institution 100, title 250, description 200, filePath 500, fileType 50). Use `@db.VarChar(n)` or Prisma's max length where applicable.
- **Business rule in application layer (later ticket):** "Max 3 education records per candidate" – not enforced in DB; enforce in service/validator.
- **Migrations:** One migration adding these models and relations; no breaking change to existing `User` table.

### Validation and AC

- `npx prisma migrate dev` runs successfully and migration is reversible (e.g. `migrate resolve --rolled-back` or new down migration).
- `npx prisma validate` passes.
- Schema is consistent with data-model.md and api-spec.yml (CreateCandidateRequest / Education / WorkExperience / Resume).
- No implementation code for routes or services in this ticket.

### Dependency

This ticket has no dependencies. It must be completed before Ticket #2 (Backend API).

---

## [enhanced]

### Summary

As a **developer**, I need the **Candidate aggregate** (Candidate, Education, WorkExperience, Resume) defined in the database with Prisma so that the ATS can persist candidate profiles, education, work experience, and resume metadata. This ticket is **database-only**: no new API endpoints, no new routes, and no UI. Existing `User` model must remain unchanged.

### Full description

- Add four Prisma models: **Candidate**, **Education**, **WorkExperience**, **Resume**, with correct types, lengths, uniqueness, and relations.
- **Candidate** is the aggregate root; Education, WorkExperience, and Resume are child entities with `candidateId` foreign keys and cascade behaviour as specified below.
- The relation from Candidate to **Application** is deferred: do **not** add the Application model in this ticket. It will be introduced when Position/InterviewFlow exist. Candidate schema should be ready to add `applications Application[]` later without breaking changes.
- One **migration** must be created and applied successfully; schema must pass `prisma validate` and remain aligned with `ai-specs/specs/data-model.md` and `ai-specs/specs/api-spec.yml` (CreateCandidateRequest, Education, WorkExperience, Resume schemas).

### Fields to add (comprehensive)

**Candidate**

| Field       | Type    | Constraints / Notes |
|------------|---------|----------------------|
| id         | Int     | `@id @default(autoincrement())` |
| firstName  | String  | Required, max 100 chars → `@db.VarChar(100)` |
| lastName   | String  | Required, max 100 chars → `@db.VarChar(100)` |
| email      | String  | Required, unique, max 255 chars → `@unique @db.VarChar(255)` |
| phone      | String? | Optional, max 15 chars → `@db.VarChar(15)` |
| address    | String? | Optional, max 100 chars → `@db.VarChar(100)` |

Relations: `educations Education[]`, `workExperiences WorkExperience[]`, `resumes Resume[]`. (Do not add `applications` until Application model exists.)

**Education**

| Field       | Type     | Constraints / Notes |
|------------|----------|----------------------|
| id         | Int      | `@id @default(autoincrement())` |
| candidateId| Int      | FK to Candidate, relation name `candidate` |
| institution| String   | Required, max 100 → `@db.VarChar(100)` |
| title      | String   | Required, max 250 → `@db.VarChar(250)` |
| startDate  | DateTime | Required |
| endDate    | DateTime?| Optional (ongoing education) |

Relation: `candidate Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)` (or project standard).

**WorkExperience**

| Field       | Type     | Constraints / Notes |
|------------|----------|----------------------|
| id         | Int      | `@id @default(autoincrement())` |
| candidateId| Int      | FK to Candidate |
| company    | String   | Required, max 100 → `@db.VarChar(100)` |
| position   | String   | Required, max 100 → `@db.VarChar(100)` |
| description| String?  | Optional, max 200 → `@db.VarChar(200)` |
| startDate  | DateTime | Required |
| endDate    | DateTime?| Optional (current job) |

Relation: `candidate Candidate @relation(...)` with appropriate `onDelete`.

**Resume**

| Field       | Type     | Constraints / Notes |
|------------|----------|----------------------|
| id         | Int      | `@id @default(autoincrement())` |
| candidateId| Int      | FK to Candidate |
| filePath   | String   | Required, max 500 → `@db.VarChar(500)` |
| fileType   | String   | Required, max 50 → `@db.VarChar(50)` |
| uploadDate | DateTime | `@default(now())` |

Relation: `candidate Candidate @relation(...)` with appropriate `onDelete`.

### Structure and scope (no endpoints)

- **No REST endpoints** in this ticket.
- **No new files** under `backend/src/` (no routes, controllers, services, or repositories).
- **Only** Prisma schema and one migration.

### Files to modify (architecture-aligned)

| Action | Path |
|--------|------|
| Modify | `backend/prisma/schema.prisma` – add models Candidate, Education, WorkExperience, Resume and relations |
| Create | `backend/prisma/migrations/<timestamp>_add_candidate_aggregate/migration.sql` – generated by `prisma migrate dev --name add_candidate_aggregate` |

Reference docs: `ai-specs/specs/data-model.md`, `ai-specs/specs/api-spec.yml`, project Prisma schema conventions (relations both sides, indexes if needed).

### Steps for completion

1. Update `backend/prisma/schema.prisma`: add Candidate, Education, WorkExperience, Resume with fields and lengths as above; define both sides of each relation; use `@db.VarChar(n)` for string lengths; keep existing `User` model unchanged.
2. Run `npx prisma migrate dev --name add_candidate_aggregate` and fix any migration issues; review generated SQL.
3. Run `npx prisma validate` and fix any validation errors.
4. Run `npx prisma generate` and confirm client generates without errors.
5. Confirm schema matches data-model.md and api-spec.yml (CreateCandidateRequest / Education / WorkExperience / Resume); document any intentional deviation in the ticket or in specs.
6. Verify migration is reversible (e.g. `migrate resolve --rolled-back` or manual rollback script if required by project).

### Documentation and tests

- **Documentation:** No new API docs (no API in scope). If project keeps a schema changelog or data-model delta, add a short note for this migration.
- **Unit/integration tests:** No new application code in this ticket, so no new unit tests for services/routes. Optional: add a small integration test that runs the migration (or use existing migration test approach if the project has one). Not mandatory for this story.

### Non-functional requirements

- **Performance:** Use indexed fields where needed (e.g. `email` is unique and will be used for lookups; Prisma/DB unique constraint provides index). Add `@@index([candidateId])` on Education, WorkExperience, and Resume if project conventions or query patterns require it.
- **Security:** No API exposure; schema does not store secrets. Ensure `DATABASE_URL` and migration execution follow project security standards (e.g. no credentials in repo).
- **Compatibility:** PostgreSQL only; no breaking change to existing `User` table or existing migrations.

### Acceptance criteria (checklist)

- [ ] `npx prisma validate` passes.
- [ ] `npx prisma migrate dev` runs successfully and creates a single new migration for the Candidate aggregate.
- [ ] Migration SQL is reviewed (no unintended drops or alters to User).
- [ ] Schema is consistent with `ai-specs/specs/data-model.md` and `ai-specs/specs/api-spec.yml` for Candidate, Education, WorkExperience, Resume.
- [ ] No new routes, controllers, services, or repositories in `backend/src/`.
- [ ] "Max 3 education records per candidate" is **not** enforced in the DB; leave for application layer (later ticket).

### Dependencies

- **Blocked by:** None.
- **Blocks:** Ticket #2 (Backend API for candidates).

---

*Note: Jira MCP was not available in this workspace. Copy the [original] and [enhanced] sections into the Jira ticket description and, if applicable, move the ticket to "Pending refinement validation".*
