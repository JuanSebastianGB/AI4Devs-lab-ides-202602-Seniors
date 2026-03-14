## Why

Recruiters need an intuitive, accessible way to add candidates to the ATS from the frontend. The backend already exposes POST /candidates and POST /upload (Ticket #2); without a form, users cannot create candidates or attach CVs from the UI. This change delivers the Add Candidate page and form so that valid submissions succeed and invalid input or file errors are shown clearly, with keyboard and screen-reader support.

## What Changes

- **Add Candidate page**: New route (e.g. `/add-candidate` or `/candidates/new`) rendering a form for profile (firstName, lastName, email, phone, address), up to 3 education entries, one or more work experience entries, and optional CV upload (PDF/DOCX, max 10MB).
- **Two-step flow**: Optional file selection → POST /upload to obtain filePath/fileType → on submit, POST /candidates with JSON including optional `cv: { filePath, fileType }`. No raw file in JSON.
- **Client-side validation**: Rules mirroring backend (name length/pattern, email format, optional phone Spanish format, field lengths, required dates, max 3 educations). Inline or summary errors; submit disabled or blocked when invalid.
- **Services and types**: New `candidateService.createCandidate`, `uploadService.uploadFile`; types aligned with CreateCandidateRequest/CreateCandidateResponse (api-spec).
- **UI**: React Bootstrap (Container, Row, Col, Form, Button, Alert); add/remove education and experience rows; success message and optional redirect; display backend validation/error details on API failure.
- **Accessibility**: Semantic HTML, visible labels, aria-label on file input and buttons, aria-describedby for errors, keyboard navigable, "Add Candidate" reachable from app shell.
- **Tests**: Component tests for validation and submit (mocked services); optional E2E for add-candidate flow.

## Capabilities

### New Capabilities

- `add-candidate-form`: Add Candidate page and form (profile, education, work experience, optional CV upload), client-side validation aligned with backend, two-step upload-then-submit flow, accessible UI, and entry point from app shell.

### Modified Capabilities

- None. This change consumes existing `candidate-api` and `file-upload` specs; it does not change their requirements.

## Impact

- **Frontend**: New pages, components, services, and types under `frontend/src/` (types, services, pages, components/AddCandidate, App routing). React Bootstrap and React Router added if not present.
- **APIs**: Uses existing POST /candidates and POST /upload; no backend changes.
- **Dependencies**: Blocked by Ticket #2 (backend endpoints). Requires env (e.g. `REACT_APP_API_URL`) for API base URL.
- **Tests**: New component tests (and optional E2E) in frontend.

## Non-goals

- Candidate list or detail pages (out of scope; may follow later).
- Backend API or file-upload requirement changes.
- Single multipart submit (flow remains two-step: upload then create).
