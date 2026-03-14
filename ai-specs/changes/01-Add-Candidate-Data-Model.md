# Ticket #1 – Data model and persistence (Candidate aggregate)

**Feature:** Add Candidate to ATS  
**Goal:** Introduce the Candidate aggregate in the database so the app can persist candidates with education, work experience, and resume metadata. No API or UI in this ticket.

---

## Objective

Introduce the Candidate aggregate in the database so the app can persist candidates with education, work experience, and resume metadata. No API or UI in this ticket.

---

## Codebase impact

| Action  | Path |
|---------|------|
| Modify  | `backend/prisma/schema.prisma` |
| Create  | `backend/prisma/migrations/<timestamp>_add_candidate_aggregate/` (migration SQL) |

---

## Technical requirements

- **Prisma models** (aligned with `ai-specs/specs/data-model.md` and api-spec schemas):
  - **Candidate**: `id`, `firstName`, `lastName`, `email` (unique), `phone` (optional), `address` (optional); relations to `Education[]`, `WorkExperience[]`, `Resume[]`, `Application[]`.
  - **Education**: `id`, `candidateId`, `institution`, `title`, `startDate`, `endDate?`; relation to `Candidate`.
  - **WorkExperience**: `id`, `candidateId`, `company`, `position`, `description?`, `startDate`, `endDate?`; relation to `Candidate`.
  - **Resume**: `id`, `candidateId`, `filePath`, `fileType`, `uploadDate` (default `now()`); relation to `Candidate`.
- **Field constraints**: String lengths per spec (e.g. firstName/lastName 100, email 255, phone 15, address 100, institution 100, title 250, description 200, filePath 500, fileType 50). Use `@db.VarChar(n)` or Prisma's max length where applicable.
- **Business rule in application layer (later ticket):** "Max 3 education records per candidate" – not enforced in DB; enforce in service/validator.
- **Migrations:** One migration adding these models and relations; no breaking change to existing `User` table.

---

## Validation and AC

- `npx prisma migrate dev` runs successfully and migration is reversible (e.g. `migrate resolve --rolled-back` or new down migration).
- `npx prisma validate` passes.
- Schema is consistent with data-model.md and api-spec.yml (CreateCandidateRequest / Education / WorkExperience / Resume).
- No implementation code for routes or services in this ticket.

---

## Dependency

This ticket has no dependencies. It must be completed before Ticket #2 (Backend API).
