## 1. Domain and validation schemas

- [x] 1.1 Add CandidateRepository interface in domain/repositories (e.g. create(data): Promise<Candidate>)
- [x] 1.2 Add Zod schemas for CreateCandidateRequest and nested educations, workExperiences, cv in application/schemas/candidateSchemas.ts (max 3 educations, Spanish phone regex, lengths per api-spec)
- [x] 1.3 Add unit tests for candidate schemas (valid payload, invalid email, long names, >3 educations, invalid phone, invalid dates)

## 2. Infrastructure

- [x] 2.1 Implement PrismaCandidateRepository in infrastructure/repositories with create in transaction (Candidate + Education + WorkExperience + Resume)
- [x] 2.2 Add upload config (multer): dest from UPLOAD_DIR, limits 10MB, fileFilter for PDF/DOCX only; sanitize filename (no user path)
- [x] 2.3 Add unit or integration test for PrismaCandidateRepository create and transaction rollback on failure

## 3. Application services

- [x] 3.1 Implement candidateService.create: validate or assume validated input, check duplicate email, call repository create in transaction, return CreateCandidateResponse shape
- [x] 3.2 Implement uploadService.upload: validate MIME (PDF/DOCX via magic-bytes or similar) and size, generate safe path (e.g. uploads/<year>/<uuid>.<ext>), save file, return { filePath, fileType }
- [x] 3.3 Add unit tests for candidateService (success, duplicate email)
- [x] 3.4 Add unit tests for uploadService (success, wrong MIME, oversized file, path sanitization)

## 4. Presentation and routes

- [x] 4.1 Add candidateController: parse body, validate with Zod, call candidateService, return 201 or 400/409/500 with structured error payload
- [x] 4.2 Add uploadController: handle multipart, call uploadService, return 200 or 400/500
- [x] 4.3 Add routes/candidates.ts (POST /candidates) and routes/upload.ts (POST /upload with multer middleware)
- [x] 4.4 Mount routes and express.json() in index.ts; keep existing error middleware for JSON errors

## 5. Integration and security

- [x] 5.1 Integration test: POST /candidates valid body → 201 and DB state; invalid body → 400 with validation details; duplicate email → 400 or 409
- [x] 5.2 Integration test: POST /upload valid PDF/DOCX ≤10MB → 200 and file on disk; wrong type or >10MB → 400
- [x] 5.3 Verify no path traversal (e.g. filename with ../) and 500 responses do not leak internal details
