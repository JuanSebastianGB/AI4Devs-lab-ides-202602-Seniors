## Why

Recruiters need a way to create candidates and attach CVs via the ATS. The data model and persistence (Candidate aggregate) are in place; the backend must expose **POST /candidates** and **POST /upload** with validation and secure file handling so the frontend can submit forms and link uploaded files to candidates without injection or unsafe storage.

## What Changes

- **POST /candidates**: New endpoint accepting JSON `CreateCandidateRequest`; Zod validation; create Candidate plus related Education, WorkExperience, and optional Resume in one transaction; return 201 with `CreateCandidateResponse`; 400/409 for validation or duplicate email.
- **POST /upload**: New endpoint for multipart CV upload; validate MIME (PDF/DOCX) and size (max 10MB); store under `UPLOAD_DIR` with safe filenames (e.g. UUID + extension); return 200 with `{ filePath, fileType }` for use in `POST /candidates` body.
- **Backend structure**: Domain (Candidate repository interface, optional domain models), application (candidateService, uploadService, Zod schemas), presentation (candidateController, uploadController), infrastructure (PrismaCandidateRepository, upload config); routes and `index.ts` wiring.
- **Error handling**: 400 with structured validation payload (`code`, `details`); 409 or 400 for duplicate email; 500 generic message; log details server-side only.
- **Tests**: Unit tests for schemas and services; integration tests for both endpoints and security (no path traversal).

## Capabilities

### New Capabilities

- `candidate-api`: REST API for creating a candidate (POST /candidates) with validated body, transaction-based creation of Candidate and related Education, WorkExperience, Resume; duplicate-email handling and structured validation errors.
- `file-upload`: Secure CV upload (POST /upload) with MIME/size validation, safe storage outside web root, and response `{ filePath, fileType }` for linking to candidate.

### Modified Capabilities

- *(None. candidate-aggregate spec describes persistence only; this change adds API layer on top.)*

## Impact

- **Backend**: New domain repository interface and optional models; application services (candidateService, uploadService) and Zod schemas; controllers and routes; Prisma repository implementation; upload config (multer, limits, fileFilter); `index.ts` updated to mount routes and `express.json()`.
- **APIs**: New public endpoints POST /candidates and POST /upload; request/response shapes aligned with `ai-specs/specs/api-spec.yml`.
- **Dependencies**: Depends on Ticket #1 (data model); no new runtime dependencies beyond existing stack (Zod, multer; optional magic-bytes for MIME).
- **Config**: Optional env `UPLOAD_DIR` (default e.g. `backend/uploads`); uploads directory outside public web root.

## Non-goals

- No GET/PATCH/DELETE candidate endpoints in this change.
- No Application model or job-application flow.
- No change to User or auth; endpoints are additive.
