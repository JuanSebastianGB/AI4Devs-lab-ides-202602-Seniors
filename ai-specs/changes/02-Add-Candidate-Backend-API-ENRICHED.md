# Ticket #2 – Backend API: Create Candidate and secure file upload – Enriched User Story

Use this content to update the Jira ticket: paste the sections below into the ticket description, keeping ** [original] ** and ** [enhanced] ** as separate H2 headings. If the ticket was in "To refine", move it to "Pending refinement validation".

---

## [original]

**Feature:** Add Candidate to ATS  
**Goal:** Implement `POST /candidates` (create candidate with validated body) and `POST /upload` (secure CV upload returning `filePath`/`fileType`). Validation and storage must prevent injection and enforce file type/size.

### Objective

Implement `POST /candidates` (create candidate with validated body) and `POST /upload` (secure CV upload returning `filePath`/`fileType`). Validation and storage must prevent injection and enforce file type/size.

### Codebase impact

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

### Technical requirements

#### Validation (Zod or existing validator)

- **CreateCandidateRequest:** `firstName`, `lastName` (required, 2–100 chars, letters-only pattern), `email` (required, email format), `phone` (optional, Spanish format `(6|7|9)\d{8}`), `address` (optional, max 100). Nested: `educations` array (max 3 items), each `CreateEducationRequest`: `institution` (required, max 100), `title` (required, max 250), `startDate` (date/ISO), `endDate` (optional); `workExperiences` array, each `CreateWorkExperienceRequest`: `company` (required, max 100), `position` (required, max 100), `description` (optional, max 200), `startDate`, `endDate` (optional). Optional `cv`: `{ filePath: string, fileType: string }` (or omit if upload is separate and backend assigns path).
- Return 400 with structured error payload (e.g. `code: "VALIDATION_ERROR"`, `details: [{ field, message }]`) and 409 or 400 when email already exists.

#### Create candidate flow

- Application service creates Candidate in transaction: create Candidate, then create Education/WorkExperience/Resume records; if `cv` is provided, link Resume with `filePath`/`fileType` and `uploadDate = now()`. Use repository interface; inject Prisma implementation.

#### File upload security

- **Allowed types:** PDF (`application/pdf`), DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Validate by MIME (e.g. from multer + magic-bytes or similar), not only extension.
- **Max size:** 10MB.
- **Storage:** Save to a directory outside the public web root (e.g. `backend/uploads` or env `UPLOAD_DIR`); use sanitized filename (UUID or hash + safe extension) to avoid path traversal and overwrite.
- **Path handling:** No user-controlled path; server computes path; store relative path in DB (e.g. `uploads/<year>/<uuid>.pdf`). Reject double extensions and path traversal in original filename.
- **Response:** 200 with `{ filePath, fileType }` for use in `POST /candidates` body.

#### Error handling

- 400 (validation, file type/size), 404 (e.g. candidate by id for future use), 500 with generic message; log details server-side only.

### Validation and AC

- `POST /candidates` with valid body returns 201 and body matches `CreateCandidateResponse`; persisted in DB with related Education/WorkExperience/Resume when provided.
- `POST /candidates` with invalid body (bad email, long name, invalid nested object) returns 400 and validation details.
- Duplicate email returns 400 or 409 with clear message.
- `POST /upload` with valid PDF/DOCX (≤10MB) returns 200 with `filePath` and `fileType`; file exists on disk at expected path.
- `POST /upload` with wrong type or >10MB returns 400.
- Unit tests for Zod/validator rules; integration tests for create candidate and upload (and optionally E2E with real HTTP). No injection via filename or path.

### Dependency

Depends on **Ticket #1** (Data model and persistence). Must be completed before Ticket #3 (Frontend).

---

## [enhanced]

### Summary

As a **developer/recruiter**, I need **two backend endpoints**: (1) **POST /candidates** to create a candidate with validated personal data, education, work experience, and optional CV reference; (2) **POST /upload** to securely upload a CV (PDF/DOCX, max 10MB) and receive `filePath` and `fileType` for use in the create-candidate request. Validation must prevent injection; file upload must validate MIME and size and store files outside the web root with safe filenames.

### Full description

- **POST /candidates**: Accept JSON body matching `CreateCandidateRequest` (see api-spec.yml). Validate with Zod (or project validator); enforce max 3 education records, string lengths, email format, optional phone (Spanish format), dates. Create Candidate and related Education, WorkExperience, and Resume in a single transaction via repository; return 201 with `CreateCandidateResponse`. On duplicate email return 400 or 409 with clear message; on validation failure return 400 with structured error (code + details).
- **POST /upload**: Accept `multipart/form-data` with field `file`. Validate MIME type (PDF or DOCX via magic-bytes or similar, not only extension); max size 10MB. Save to configured directory (e.g. `UPLOAD_DIR` or `backend/uploads`) with safe filename (e.g. UUID + extension); return 200 with `{ filePath, fileType }` (FileUploadResponse). Reject path traversal and double extensions; do not expose internal paths.
- Follow project DDD layers: domain (models, repository interface), application (candidateService, uploadService, validation schemas), presentation (controllers), infrastructure (Prisma repository, upload config); inject repository into service. Use existing error middleware pattern; 500 responses must not leak internal details to the client.

### Endpoints (structure and URLs)

| Method | URL | Request body | Success | Error (examples) |
|--------|-----|--------------|---------|------------------|
| POST | `/candidates` | JSON: CreateCandidateRequest | 201, CreateCandidateResponse | 400 validation/duplicate email, 500 |
| POST | `/upload` | multipart/form-data, field `file` | 200, FileUploadResponse | 400 invalid type/size, 500 |

**CreateCandidateRequest** (aligned with api-spec.yml):

- `firstName` (string, required, 2–100 chars, letters-only), `lastName` (string, required, 2–100 chars, letters-only), `email` (string, required, email format), `phone` (string, optional, Spanish format `(6|7|9)\d{8}`), `address` (string, optional, max 100).
- `educations` (array, optional, max 3 items): each `{ institution, title, startDate, endDate? }` — institution max 100, title max 250, dates ISO.
- `workExperiences` (array, optional): each `{ company, position, description?, startDate, endDate? }` — company/position max 100, description max 200.
- `cv` (object, optional): `{ filePath: string, fileType: string }` (as returned by POST /upload).

**CreateCandidateResponse**: `id`, `firstName`, `lastName`, `email`, `phone?`, `address?` (per api-spec).

**FileUploadResponse**: `filePath`, `fileType` (per api-spec).

**Error response (validation)**: 400 with body e.g. `{ message: string, error?: string, code?: "VALIDATION_ERROR", details?: [{ field: string, message: string }] }` — align with project ErrorResponse format where applicable.

### Files to create or modify (architecture-aligned)

| Action | Path | Purpose |
|--------|------|---------|
| Create | `backend/src/domain/models/Candidate.ts` | Domain entity (or reuse Prisma types; optional Education/WorkExperience/Resume types) |
| Create | `backend/src/domain/repositories/CandidateRepository.ts` | Interface (e.g. `create(data): Promise<Candidate>`) |
| Create | `backend/src/infrastructure/repositories/PrismaCandidateRepository.ts` | Prisma implementation of CandidateRepository |
| Create | `backend/src/application/services/candidateService.ts` | Create candidate in transaction (Candidate + Education + WorkExperience + Resume) |
| Create | `backend/src/application/schemas/candidateSchemas.ts` (or `validator.ts`) | Zod schemas for CreateCandidateRequest and nested objects |
| Create | `backend/src/application/uploadService.ts` | Validate MIME/size, save file, return filePath/fileType |
| Create | `backend/src/presentation/controllers/candidateController.ts` | POST /candidates handler |
| Create | `backend/src/presentation/controllers/uploadController.ts` | POST /upload handler |
| Create | `backend/src/routes/candidates.ts` | Mount candidate controller |
| Create | `backend/src/routes/upload.ts` | Mount upload controller (multer middleware) |
| Create | `backend/src/config/upload.ts` | Multer config: dest, limits (10MB), fileFilter; allowed MIME types |
| Modify | `backend/src/index.ts` | `app.use(express.json())`, mount `/candidates` and `/upload` routes |
| Create | Unit tests | Validator/schemas (Zod), candidateService (mocked repo), uploadService (safe path, MIME/size) |
| Create | Integration tests | POST /candidates (success, validation, duplicate email), POST /upload (success, wrong type, >10MB); no path traversal |

### Steps for completion

1. **Domain**: Add Candidate repository interface; optionally domain model(s) or use Prisma types.
2. **Infrastructure**: Implement PrismaCandidateRepository (create candidate with nested create for Education, WorkExperience, Resume in transaction).
3. **Validation**: Define Zod schemas for CreateCandidateRequest (and nested educations, workExperiences, cv); max 3 educations; Spanish phone regex; export parsed type.
4. **Candidate service**: Implement create(data): validate or assume validated input; check duplicate email (repository or service); create Candidate + relations in transaction; return CreateCandidateResponse shape.
5. **Upload service**: Implement upload(file): validate MIME (PDF/DOCX via magic-bytes or similar), max 10MB; generate safe path (e.g. `uploads/<year>/<uuid>.<ext>`); save file; return `{ filePath, fileType }`.
6. **Upload config**: Multer dest, limits (10MB), fileFilter; reject non-PDF/DOCX; sanitize filename (no user-controlled path).
7. **Controllers**: candidateController — parse body, validate with Zod, call candidateService, return 201 or 400/409/500; uploadController — handle multipart, call uploadService, return 200 or 400/500.
8. **Routes**: Register POST /candidates and POST /upload; wire controllers and (for upload) multer.
9. **index.ts**: Use `express.json()`, mount routes, keep existing error middleware (adapt if needed for JSON errors).
10. **Tests**: Unit tests for schemas and services; integration tests for both endpoints and security (no path traversal).

### Documentation and tests

- **Documentation**: API is already described in `ai-specs/specs/api-spec.yml` (POST /candidates, POST /upload). No separate doc update required unless the project keeps a backend README; then add a short note on the new routes and env (e.g. `UPLOAD_DIR`).
- **Unit tests**: Zod schemas (valid payload, invalid email, long names, >3 educations, invalid phone, invalid dates); candidateService (success, duplicate email, transaction rollback on failure); uploadService (success, wrong MIME, oversized file, path sanitization).
- **Integration tests**: POST /candidates with valid body → 201 and DB state; invalid body → 400 and validation details; duplicate email → 400/409; POST /upload with valid file → 200 and file on disk; wrong type or >10MB → 400. Verify no path traversal (e.g. filename with `../`).
- **Coverage**: Meet project threshold (e.g. 90%); include error branches and edge cases.

### Non-functional requirements

- **Security**: Validate all inputs (Zod); no raw user input for file path or DB; sanitize filenames; store uploads outside public web root; validate MIME by content where possible (e.g. magic-bytes); log errors server-side only; 500 responses generic.
- **Performance**: Single DB transaction for create candidate; avoid loading unnecessary relations in response; keep uploads on local or configured storage (no blocking on external services).
- **Maintainability**: Follow DDD layers and dependency injection (repository interface); use project naming (camelCase files, PascalCase classes); English only for code, logs, and errors.

### Acceptance criteria (checklist)

- [ ] POST /candidates with valid body returns 201 and response matches CreateCandidateResponse; Candidate and related Education/WorkExperience/Resume (and Resume if `cv` provided) persisted in DB.
- [ ] POST /candidates with invalid body returns 400 with structured validation details (e.g. code, details with field/message).
- [ ] POST /candidates with duplicate email returns 400 or 409 with clear message.
- [ ] POST /upload with valid PDF or DOCX (≤10MB) returns 200 with `filePath` and `fileType`; file stored at expected path; path usable in POST /candidates `cv`.
- [ ] POST /upload with wrong MIME or size >10MB returns 400.
- [ ] No path traversal or injection via filename/path; MIME validation not based on extension only where feasible.
- [ ] Unit tests for validation and services; integration tests for both endpoints; 90% coverage where required by project.

### Dependencies

- **Blocked by:** Ticket #1 (Data model and persistence – Candidate, Education, WorkExperience, Resume in Prisma).
- **Blocks:** Ticket #3 (Frontend form for adding candidate).

---

*Note: Jira MCP was not available in this workspace. Copy the [original] and [enhanced] sections into the Jira ticket description and, if applicable, move the ticket to "Pending refinement validation".*
