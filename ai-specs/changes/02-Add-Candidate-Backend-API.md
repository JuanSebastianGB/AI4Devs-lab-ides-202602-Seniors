# Ticket #2 – Backend API: Create Candidate and secure file upload

**Feature:** Add Candidate to ATS  
**Goal:** Implement `POST /candidates` (create candidate with validated body) and `POST /upload` (secure CV upload returning `filePath`/`fileType`). Validation and storage must prevent injection and enforce file type/size.

---

## Objective

Implement `POST /candidates` (create candidate with validated body) and `POST /upload` (secure CV upload returning `filePath`/`fileType`). Validation and storage must prevent injection and enforce file type/size.

---

## Codebase impact

| Action  | Path |
|---------|------|
| Create  | `backend/src/domain/models/Candidate.ts` (and optionally Education, WorkExperience, Resume value types or reuse Prisma types) |
| Create  | `backend/src/domain/repositories/CandidateRepository.ts` (interface) |
| Create  | `backend/src/infrastructure/repositories/PrismaCandidateRepository.ts` (or under `infrastructure/`) |
| Create  | `backend/src/application/services/candidateService.ts` |
| Create  | `backend/src/application/validator.ts` or `backend/src/application/schemas/candidateSchemas.ts` (Zod) |
| Create  | `backend/src/application/uploadService.ts` (or equivalent: validate file, store, return path/type) |
| Create  | `backend/src/presentation/controllers/candidateController.ts` |
| Create  | `backend/src/presentation/controllers/uploadController.ts` |
| Create  | `backend/src/routes/candidates.ts`, `backend/src/routes/upload.ts` |
| Modify  | `backend/src/index.ts` (mount routes, `express.json()`, optional `express.static` for uploads if needed) |
| Create  | `backend/src/config/upload.ts` or similar (multer config, allowed MIME types, size limit) |
| Create  | Unit/integration tests for validator, candidateService, upload flow, controllers |

---

## Technical requirements

### Validation (Zod or existing validator)

- **CreateCandidateRequest:** `firstName`, `lastName` (required, 2–100 chars, letters-only pattern), `email` (required, email format), `phone` (optional, Spanish format `(6|7|9)\d{8}`), `address` (optional, max 100). Nested: `educations` array (max 3 items), each `CreateEducationRequest`: `institution` (required, max 100), `title` (required, max 250), `startDate` (date/ISO), `endDate` (optional); `workExperiences` array, each `CreateWorkExperienceRequest`: `company` (required, max 100), `position` (required, max 100), `description` (optional, max 200), `startDate`, `endDate` (optional). Optional `cv`: `{ filePath: string, fileType: string }` (or omit if upload is separate and backend assigns path).
- Return 400 with structured error payload (e.g. `code: "VALIDATION_ERROR"`, `details: [{ field, message }]`) and 409 or 400 when email already exists.

### Create candidate flow

- Application service creates Candidate in transaction: create Candidate, then create Education/WorkExperience/Resume records; if `cv` is provided, link Resume with `filePath`/`fileType` and `uploadDate = now()`. Use repository interface; inject Prisma implementation.

### File upload security

- **Allowed types:** PDF (`application/pdf`), DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Validate by MIME (e.g. from multer + magic-bytes or similar), not only extension.
- **Max size:** 10MB.
- **Storage:** Save to a directory outside the public web root (e.g. `backend/uploads` or env `UPLOAD_DIR`); use sanitized filename (UUID or hash + safe extension) to avoid path traversal and overwrite.
- **Path handling:** No user-controlled path; server computes path; store relative path in DB (e.g. `uploads/<year>/<uuid>.pdf`). Reject double extensions and path traversal in original filename.
- **Response:** 200 with `{ filePath, fileType }` for use in `POST /candidates` body.

### Error handling

- 400 (validation, file type/size), 404 (e.g. candidate by id for future use), 500 with generic message; log details server-side only.

---

## Validation and AC

- `POST /candidates` with valid body returns 201 and body matches `CreateCandidateResponse`; persisted in DB with related Education/WorkExperience/Resume when provided.
- `POST /candidates` with invalid body (bad email, long name, invalid nested object) returns 400 and validation details.
- Duplicate email returns 400 or 409 with clear message.
- `POST /upload` with valid PDF/DOCX (≤10MB) returns 200 with `filePath` and `fileType`; file exists on disk at expected path.
- `POST /upload` with wrong type or >10MB returns 400.
- Unit tests for Zod/validator rules; integration tests for create candidate and upload (and optionally E2E with real HTTP). No injection via filename or path.

---

## Dependency

Depends on **Ticket #1** (Data model and persistence). Must be completed before Ticket #3 (Frontend).
