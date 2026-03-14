## Context

The backend uses Prisma with PostgreSQL. The schema currently has only a **User** model. The ATS product requires persisting candidates with education, work experience, and resume metadata. This change adds the Candidate aggregate (four models) and one migration; no API or application code.

Reference: `ai-specs/specs/data-model.md`, `ai-specs/specs/api-spec.yml` (CreateCandidateRequest / Education / WorkExperience / Resume), and project Prisma conventions.

## Goals / Non-Goals

**Goals:**
- Add Candidate, Education, WorkExperience, and Resume to the Prisma schema with correct types, lengths, and relations.
- Create one reversible migration; keep existing User table and migrations unchanged.
- Align schema with data-model.md and API request shapes for future tickets.

**Non-Goals:**
- No Application model or Candidate→Application relation (deferred).
- No REST endpoints, routes, services, or repositories.
- No enforcement of "max 3 education records per candidate" in the DB (application layer later).

## Decisions

| Decision | Rationale | Alternatives considered |
|----------|-----------|--------------------------|
| Use `@db.VarChar(n)` for all string lengths | Matches data-model.md and api-spec constraints; avoids silent truncation. | Prisma `@db.Text` without length (rejected: spec defines max lengths). |
| `onDelete: Cascade` on child relations (Education, WorkExperience, Resume) | Deleting a candidate should remove related records; no orphaned rows. | `onDelete: SetNull` or Restrict (rejected: no use case for keeping orphans). |
| No `applications` relation on Candidate in this change | Application model does not exist yet; adding later avoids breaking this migration. | Add Application model now (rejected: out of scope per ticket). |
| Single migration `add_candidate_aggregate` | One logical unit; easy to review and roll back. | Multiple migrations per model (rejected: unnecessary complexity). |
| Optional `@@index([candidateId])` on child models | Speeds up queries by candidate; Prisma/PostgreSQL convention for FK lookups. | No index (acceptable if project does not require it); add only if conventions ask for it. |

## Risks / Trade-offs

- **Risk:** Migration fails on existing DB (e.g. extensions or permissions). **Mitigation:** Run `prisma migrate dev` in a dev environment first; document rollback (e.g. `migrate resolve --rolled-back` or manual down script if needed).
- **Trade-off:** No application-level validation in this change (e.g. max 3 education). Acceptable; validation belongs in the API/service ticket.

## Migration Plan

1. Update `backend/prisma/schema.prisma` with the four models and relations.
2. Run `npx prisma migrate dev --name add_candidate_aggregate`; fix any generated SQL or validation issues.
3. Run `npx prisma validate` and `npx prisma generate`; confirm success.
4. **Rollback:** If needed, use project rollback approach (e.g. `migrate resolve --rolled-back` for the new migration, then revert schema and re-apply previous migrations).

## Open Questions

- None; scope is limited to schema and migration.
