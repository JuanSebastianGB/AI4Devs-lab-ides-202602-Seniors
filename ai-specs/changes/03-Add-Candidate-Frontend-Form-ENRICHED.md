# Ticket #3 – Frontend: Add Candidate form and CV upload (accessible UI) – Enriched User Story

Use this content to update the Jira ticket: paste the sections below into the ticket description, keeping ** [original] ** and ** [enhanced] ** as separate H2 headings. If the ticket was in "To refine", move it to "Pending refinement validation".

---

## [original]

**Feature:** Add Candidate to ATS  
**Goal:** Provide an intuitive, accessible "Add Candidate" UI: form for name, email, phone, address, education, experience, and CV upload (PDF/DOCX). Validation aligned with backend; keyboard and screen-reader friendly.

### Objective

Provide an intuitive, accessible "Add Candidate" UI: form for name, email, phone, address, education, experience, and CV upload (PDF/DOCX). Validation aligned with backend; keyboard and screen-reader friendly.

### Codebase impact

| Action  | Path |
|---------|------|
| Create  | `frontend/src/types/candidate.ts` (CreateCandidateRequest, Education, WorkExperience, etc.) |
| Create  | `frontend/src/services/candidateService.ts` (axios: createCandidate, optionally getCandidates) |
| Create  | `frontend/src/services/uploadService.ts` (axios: uploadFile multipart) |
| Create  | `frontend/src/pages/AddCandidatePage.tsx` or `frontend/src/components/AddCandidate/AddCandidateForm.tsx` (and container if needed) |
| Create  | `frontend/src/components/AddCandidate/` (e.g. EducationFields, ExperienceFields, FileInput with label/error) |
| Modify  | `frontend/src/App.tsx` (and routing if present) to expose route to Add Candidate |
| Create  | Tests: component tests for form validation and submission; optional Cypress E2E for add-candidate flow |

### Technical requirements

#### Form

- Controlled components; state for candidate profile, array of education entries (max 3), array of experience entries; CV file (state or ref). Client-side validation rules mirror backend (name 2–100 letters, email format, optional phone Spanish format, optional address length, education/experience required fields and dates).

#### Flow

- Either (A) user selects file → call `POST /upload` → receive `filePath`/`fileType` → on submit call `POST /candidates` with JSON including `cv: { filePath, fileType }`, or (B) single multipart submit if backend later supports it; ticket assumes (A) unless product specifies otherwise.

#### File input

- Accept `application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx`; max 10MB; show clear error for type/size; do not send raw file in JSON.

#### UI

- Bootstrap/React Bootstrap (Container, Row, Col, Form, Button, Alert). Add/remove education and experience rows with clear labels. Success: redirect or message; errors: display backend validation details.

#### Accessibility (per `ai-specs/specs/frontend-standards.mdc`)

- Semantic HTML (form, fieldset, legend where appropriate); `aria-label` on file input and buttons that need it; visible labels associated with inputs; keyboard navigable (tab order, no trap); error messages associated with fields (e.g. `aria-describedby`). Ensure "Add Candidate" entry point is reachable from app shell.

### Validation and AC

- Submitting valid data (with or without CV) creates candidate and shows success (and optionally navigates to list/detail).
- Invalid input shows inline or summary validation messages; submit is disabled or blocked until fix.
- File type/size errors are shown without calling create.
- Manual or automated a11y check: keyboard-only flow works; screen reader announces labels and errors; no critical a11y violations.
- Unit/component tests cover validation and submit behavior; optional E2E covers full add-candidate path.

### Dependency

Depends on **Ticket #2** (Backend API: Create Candidate and secure file upload). Implement after the backend endpoints are available.

---

## [enhanced]

### Summary

As a **recruiter**, I need an **Add Candidate** page with a form to enter name, email, phone, address, up to 3 education entries, and any number of work experience entries, plus an optional CV upload (PDF/DOCX, max 10MB). The UI must be intuitive, **accessible** (keyboard and screen reader), and **validation must match the backend** so that valid submissions succeed and invalid ones show clear errors. Flow: upload file first (if any) to get `filePath`/`fileType`, then on form submit send JSON to `POST /candidates` including optional `cv`.

### Full description

- **Add Candidate page**: A dedicated route (e.g. `/add-candidate` or `/candidates/new`) renders a form built with React Bootstrap (Container, Row, Col, Form, Button, Alert). The form collects: firstName, lastName, email (required); phone, address (optional); up to 3 education blocks (institution, title, startDate, endDate optional); one or more work experience blocks (company, position, description optional, startDate, endDate optional); and an optional file input for CV (PDF/DOCX, max 10MB).
- **Flow (A – two-step)**: User can optionally select a file; on selection (or before submit), call `POST /upload` with the file; on success, store `filePath` and `fileType` in state. On form submit, call `POST /candidates` with a JSON body matching CreateCandidateRequest (including `cv: { filePath, fileType }` if upload was done). Do not send the raw file in the JSON body.
- **Validation**: Client-side rules must mirror backend: firstName/lastName required, 2–100 characters, letters-only; email required, valid format; phone optional, Spanish format `(6|7|9)\d{8}`; address optional, max 100; each education: institution (max 100), title (max 250), startDate required, endDate optional; each work experience: company/position (max 100), description (max 200), startDate required, endDate optional. Max 3 education entries. Show inline or summary validation messages; disable or block submit when invalid. File: accept only PDF/DOCX; max 10MB; show clear error for wrong type or size without calling create.
- **Accessibility**: Semantic HTML (form, fieldset, legend where appropriate); visible labels for all inputs; `aria-label` on file input and icon-only buttons; error messages linked via `aria-describedby`; keyboard navigable (tab order, no focus trap); "Add Candidate" reachable from app shell (e.g. link in header or home). Per `ai-specs/specs/frontend-standards.mdc`.
- **Success/error**: On create success, show success message and optionally redirect (e.g. to candidate list or detail). On validation or API error, display backend error details (e.g. validation `details` array) in an Alert or inline.

### Fields (form ↔ API)

Form state and payload must align with **CreateCandidateRequest** and nested schemas in `ai-specs/specs/api-spec.yml`:

| Section | Field | Type | Validation (client) | Required |
|---------|--------|------|----------------------|----------|
| Profile | firstName | string | 2–100 chars, letters only | Yes |
| Profile | lastName | string | 2–100 chars, letters only | Yes |
| Profile | email | string | Valid email | Yes |
| Profile | phone | string | Optional; if present: `(6|7|9)\d{8}` | No |
| Profile | address | string | Max 100 | No |
| Education (max 3) | institution | string | Max 100 | Yes per entry |
| Education | title | string | Max 250 | Yes per entry |
| Education | startDate | date | Valid date | Yes per entry |
| Education | endDate | date | Optional | No |
| Work experience | company | string | Max 100 | Yes per entry |
| Work experience | position | string | Max 100 | Yes per entry |
| Work experience | description | string | Max 200 | No |
| Work experience | startDate | date | Valid date | Yes per entry |
| Work experience | endDate | date | Optional | No |
| CV | file | file | PDF or DOCX, ≤10MB | No (optional upload) |

After upload, `cv` in payload: `{ filePath: string, fileType: string }`.

### Endpoints and services

| Service method | HTTP | URL | Request | Response |
|----------------|------|-----|---------|----------|
| createCandidate | POST | `/candidates` | JSON: CreateCandidateRequest | 201 → CreateCandidateResponse |
| uploadFile | POST | `/upload` | multipart/form-data, field `file` | 200 → { filePath, fileType } |

- **candidateService.ts**: `createCandidate(data: CreateCandidateRequest): Promise<CreateCandidateResponse>`; use axios; base URL from env (e.g. `REACT_APP_API_URL`).
- **uploadService.ts**: `uploadFile(file: File): Promise<{ filePath: string; fileType: string }>`; FormData with field `file`; handle 400 (type/size) and 500.

### Files to create or modify (architecture-aligned)

| Action | Path | Purpose |
|--------|------|---------|
| Create | `frontend/src/types/candidate.ts` | Types: CreateCandidateRequest, CreateEducationRequest, CreateWorkExperienceRequest, CreateResumeRequest (cv), CreateCandidateResponse; align with api-spec |
| Create | `frontend/src/services/candidateService.ts` | createCandidate(data) → POST /candidates |
| Create | `frontend/src/services/uploadService.ts` | uploadFile(file) → POST /upload multipart |
| Create | `frontend/src/pages/AddCandidatePage.tsx` (or under components) | Page that renders Add Candidate form and wires services |
| Create | `frontend/src/components/AddCandidate/AddCandidateForm.tsx` | Main form: profile fields, education/experience arrays, file input; controlled state; validation; submit handler |
| Create | `frontend/src/components/AddCandidate/EducationFields.tsx` (or similar) | Reusable block for one education entry (institution, title, startDate, endDate) with add/remove if used in a list |
| Create | `frontend/src/components/AddCandidate/ExperienceFields.tsx` (or similar) | Reusable block for one work experience entry (company, position, description, startDate, endDate) |
| Create | `frontend/src/components/AddCandidate/FileInput.tsx` (or inline) | File input with accept, max size 10MB, label, error display, aria-label |
| Modify | `frontend/src/App.tsx` | Add route for Add Candidate page (e.g. `/add-candidate`); ensure app shell exposes entry (link/nav). If project uses React Router, add Route and link. |
| Create | Tests | Component tests for form validation and submit; optional Cypress E2E for add-candidate flow |

**Note:** If React Bootstrap or React Router are not yet in the project, add them per `ai-specs/specs/frontend-standards.mdc` (Bootstrap/React Bootstrap, React Router DOM).

### Steps for completion

1. **Types**: Define CreateCandidateRequest, nested education/workExperience/cv types, and CreateCandidateResponse in `frontend/src/types/candidate.ts` (aligned with api-spec.yml).
2. **Services**: Implement candidateService.createCandidate and uploadService.uploadFile with axios; use env for API base URL; handle errors and return typed responses.
3. **Form state**: In AddCandidateForm (or page), use controlled state for profile fields, educations array (max 3), workExperiences array, and optional cv result (filePath/fileType). Optionally store selected File for upload.
4. **Validation**: Implement client-side validation matching backend rules (lengths, regex for name/phone, email format, required fields per section). Set errors in state and show inline or in Alert; disable submit when invalid.
5. **Upload flow**: When user selects a file, validate type (PDF/DOCX) and size (≤10MB) before calling upload; on success store filePath/fileType; on error show message without calling create.
6. **Submit**: On submit, build CreateCandidateRequest (include cv if upload was successful); call createCandidate; on 201 show success and optionally navigate; on 4xx/5xx show backend error (e.g. validation details).
7. **UI**: Use React Bootstrap Container, Row, Col, Form, Button, Alert; add/remove education and experience rows with clear labels; use React DatePicker or native date input for dates if in stack.
8. **Routing**: In App.tsx, add route for Add Candidate page and a visible entry point (e.g. "Add Candidate" link).
9. **Accessibility**: Semantic form structure; visible labels; aria-label on file input and buttons; aria-describedby for errors; verify keyboard navigation and screen reader (manual or automated).
10. **Tests**: Component tests for validation (invalid email, long name, >3 educations, file type/size) and submit (mock services); optional E2E for full flow.

### Documentation and tests

- **Documentation**: No separate doc update required unless the project keeps a frontend README; then add a short note on the Add Candidate route and env (e.g. `REACT_APP_API_URL`).
- **Component tests**: Validation rules (required fields, lengths, email/phone format, max 3 educations); file type/size feedback; submit disabled when invalid; submit calls createCandidate with correct payload when valid; error display when API returns 400/409/500. Use React Testing Library; mock candidateService and uploadService.
- **E2E (optional)**: Cypress (or project E2E tool): open Add Candidate page, fill form (with and without file), submit, assert success or error message; optionally check a11y (e.g. axe).
- **Accessibility**: Manual keyboard pass and screen reader check, or integrate axe in tests; no critical a11y violations.

### Non-functional requirements

- **Accessibility**: WCAG-oriented: semantic HTML, labels, aria where needed, keyboard navigable, errors announced; "Add Candidate" reachable from shell.
- **Performance**: Validate and upload only when needed; avoid unnecessary re-renders (e.g. keep state shape flat where possible).
- **Maintainability**: Types aligned with api-spec; services in dedicated files; components under AddCandidate with clear props; English only for UI text, errors, and code.

### Acceptance criteria (checklist)

- [ ] Add Candidate page is reachable via route and from app shell (e.g. link).
- [ ] Form collects firstName, lastName, email, phone, address, up to 3 education entries, one or more work experience entries, and optional CV file.
- [ ] Client-side validation mirrors backend (names 2–100 letters, email format, phone Spanish format, lengths, required fields, max 3 educations); invalid form shows messages and submit is disabled or blocked.
- [ ] Optional file: accept PDF/DOCX only; max 10MB; type/size errors shown without calling create; on valid file, upload via POST /upload and use returned filePath/fileType in POST /candidates as `cv`.
- [ ] Submitting valid data (with or without CV) calls POST /candidates and on success shows success and optionally redirects; on API error shows backend validation/error details.
- [ ] Keyboard navigable; labels and errors accessible to screen reader; no critical a11y violations.
- [ ] Component tests for validation and submit; optional E2E for add-candidate flow.

### Dependencies

- **Blocked by:** Ticket #2 (Backend API: POST /candidates and POST /upload implemented and available).
- **Blocks:** None (optional: candidate list/detail pages or further flows).

---

*Note: Jira MCP was not available in this workspace. Copy the [original] and [enhanced] sections into the Jira ticket description and, if applicable, move the ticket to "Pending refinement validation".*
