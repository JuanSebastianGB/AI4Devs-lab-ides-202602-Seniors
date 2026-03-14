# Ticket #3 – Frontend: Add Candidate form and CV upload (accessible UI)

**Feature:** Add Candidate to ATS  
**Goal:** Provide an intuitive, accessible "Add Candidate" UI: form for name, email, phone, address, education, experience, and CV upload (PDF/DOCX). Validation aligned with backend; keyboard and screen-reader friendly.

---

## Objective

Provide an intuitive, accessible "Add Candidate" UI: form for name, email, phone, address, education, experience, and CV upload (PDF/DOCX). Validation aligned with backend; keyboard and screen-reader friendly.

---

## Codebase impact

| Action  | Path |
|---------|------|
| Create  | `frontend/src/types/candidate.ts` (CreateCandidateRequest, Education, WorkExperience, etc.) |
| Create  | `frontend/src/services/candidateService.ts` (axios: createCandidate, optionally getCandidates) |
| Create  | `frontend/src/services/uploadService.ts` (axios: uploadFile multipart) |
| Create  | `frontend/src/pages/AddCandidatePage.tsx` or `frontend/src/components/AddCandidate/AddCandidateForm.tsx` (and container if needed) |
| Create  | `frontend/src/components/AddCandidate/` (e.g. EducationFields, ExperienceFields, FileInput with label/error) |
| Modify  | `frontend/src/App.tsx` (and routing if present) to expose route to Add Candidate |
| Create  | Tests: component tests for form validation and submission; optional Cypress E2E for add-candidate flow |

---

## Technical requirements

### Form

- Controlled components; state for candidate profile, array of education entries (max 3), array of experience entries; CV file (state or ref). Client-side validation rules mirror backend (name 2–100 letters, email format, optional phone Spanish format, optional address length, education/experience required fields and dates).

### Flow

- Either (A) user selects file → call `POST /upload` → receive `filePath`/`fileType` → on submit call `POST /candidates` with JSON including `cv: { filePath, fileType }`, or (B) single multipart submit if backend later supports it; ticket assumes (A) unless product specifies otherwise.

### File input

- Accept `application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx`; max 10MB; show clear error for type/size; do not send raw file in JSON.

### UI

- Bootstrap/React Bootstrap (Container, Row, Col, Form, Button, Alert). Add/remove education and experience rows with clear labels. Success: redirect or message; errors: display backend validation details.

### Accessibility (per `ai-specs/specs/frontend-standards.mdc`)

- Semantic HTML (form, fieldset, legend where appropriate); `aria-label` on file input and buttons that need it; visible labels associated with inputs; keyboard navigable (tab order, no trap); error messages associated with fields (e.g. `aria-describedby`). Ensure "Add Candidate" entry point is reachable from app shell.

---

## Validation and AC

- Submitting valid data (with or without CV) creates candidate and shows success (and optionally navigates to list/detail).
- Invalid input shows inline or summary validation messages; submit is disabled or blocked until fix.
- File type/size errors are shown without calling create.
- Manual or automated a11y check: keyboard-only flow works; screen reader announces labels and errors; no critical a11y violations.
- Unit/component tests cover validation and submit behavior; optional E2E covers full add-candidate path.

---

## Dependency

Depends on **Ticket #2** (Backend API: Create Candidate and secure file upload). Implement after the backend endpoints are available.
