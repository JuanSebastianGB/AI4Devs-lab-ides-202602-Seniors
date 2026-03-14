## Context

The backend uses Express, Prisma, and TypeScript. The Candidate aggregate (Candidate, Education, WorkExperience, Resume) is already in the Prisma schema and persisted via a prior change. This change adds the API layer: two endpoints (POST /candidates, POST /upload), validation, application services, and secure file storage. Stakeholders: recruiters (via future frontend) and developers integrating with the API. Constraints: DDD-style layers, TDD, alignment with `ai-specs/specs/api-spec.yml` and backend standards.

## Goals / Non-Goals

**Goals:**
- Expose POST /candidates with Zod-validated CreateCandidateRequest; create Candidate and related records in a single transaction; return CreateCandidateResponse; handle duplicate email and validation errors with structured payloads.
- Expose POST /upload for CV files (PDF/DOCX, max 10MB); validate MIME and size; store under UPLOAD_DIR with safe filenames; return { filePath, fileType } for use in create-candidate body.
- Follow domain (repository interface), application (services, schemas), presentation (controllers), infrastructure (Prisma repo, upload config); dependency injection for repository.
- Ensure no path traversal or injection via filename/path; 500 responses do not leak internal details.

**Non-Goals:**
- No GET/PATCH/DELETE candidate endpoints.
- No Application model or job-application flow.
- No authentication/authorization changes.
- No change to existing User or other routes.

## Decisions

| Decision | Rationale | Alternatives considered |
|----------|-----------|--------------------------|
| Zod for request validation | Type-safe, aligns with project validator preference; structured error output (code, details). | Joi or manual checks (rejected: Zod is common in TS stack and gives good DX). |
| Repository interface in domain, Prisma impl in infrastructure | Keeps domain free of DB details; testable with mocks; matches DDD. | Use Prisma directly in service (rejected: harder to test and couples to DB). |
| Single transaction for Candidate + Education + WorkExperience + Resume | Atomic create; no partial state on failure. | Multiple requests or separate transactions (rejected: spec requires single transaction). |
| Multer for multipart; optional magic-bytes for MIME | Multer handles multipart; MIME by content (magic-bytes) reduces extension spoofing. | Trust client Content-Type only (rejected: security). |
| Store files under UPLOAD_DIR (e.g. backend/uploads), path like uploads/<year>/<uuid>.<ext> | Outside web root; no user-controlled path; reproducible structure. | Store in DB as blob (rejected: large payloads and api-spec expects filePath). |
| Duplicate email → 400 or 409 | Clear client signal; api-spec allows either. | Always 409 (acceptable); chosen to align with existing error middleware if present. |
| Error response shape: code (e.g. VALIDATION_ERROR), details (field, message) | Structured errors for frontend; align with ErrorResponse in api-spec where applicable. | Plain message only (rejected: spec asks for structured). |

## Risks / Trade-offs

- **Risk:** MIME validation by extension only is bypassable. **Mitigation:** Use magic-bytes (or similar) where feasible; reject double extensions and path traversal in filename.
- **Risk:** Upload directory permissions or disk full. **Mitigation:** Ensure UPLOAD_DIR is writable at startup or first upload; 500 with generic message; log details server-side.
- **Trade-off:** No auth on these endpoints. Acceptable for this change; auth can be added later.
- **Trade-off:** Max 3 educations enforced in application layer (Zod), not in DB. Acceptable; matches spec and keeps schema simple.

## Migration Plan

1. Add domain repository interface and optional domain types; add application services (candidateService, uploadService) and Zod schemas; add controllers and routes; add Prisma repository and upload config; wire routes and express.json() in index.ts.
2. Add unit tests (schemas, services) and integration tests (POST /candidates, POST /upload, validation, duplicate email, file type/size, path traversal).
3. **Rollback:** Revert code and route registration; leave existing DB and migrations unchanged; optionally clear uploads directory if needed.

## Open Questions

- None; scope is well defined by proposal and enriched ticket.
