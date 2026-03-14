## Context

The backend exposes POST /candidates and POST /upload (Ticket #2). The frontend is Create React App with React 18 and React Testing Library; React Bootstrap and React Router may or may not be present. This change adds the Add Candidate page and form so recruiters can create candidates and optionally attach a CV from the UI, with validation aligned to the backend and accessible interaction (keyboard, screen reader). Standards: AGENTS.md, frontend-standards.mdc; api-spec.yml defines CreateCandidateRequest and CreateCandidateResponse.

## Goals / Non-Goals

**Goals:**

- Add Candidate page reachable via route and from app shell.
- Form collects profile, up to 3 education entries, one or more work experience entries, optional CV (PDF/DOCX, ≤10MB); two-step flow (upload then submit with filePath/fileType in JSON).
- Client-side validation mirrors backend; invalid form shows errors and submit is disabled or blocked.
- Accessible UI: semantic HTML, labels, aria where needed, keyboard navigable, errors announced.
- Component tests for validation and submit; optional E2E.

**Non-Goals:**

- Candidate list or detail pages; backend or file-upload requirement changes; single multipart submit.

## Decisions

1. **Two-step flow (upload then create)**  
   **Decision:** User selects file → POST /upload → store filePath/fileType; on submit → POST /candidates with JSON including optional `cv`.  
   **Rationale:** Backend already supports this; no backend change. Single multipart submit would require backend changes.  
   **Alternative:** Single multipart request (rejected: out of scope).

2. **Form state and validation in React state**  
   **Decision:** Controlled components; form state (profile, educations, workExperiences, cv result) and validation errors in component state (or a single form state object).  
   **Rationale:** Keeps implementation simple and aligns with TDD; validation logic can be unit-tested.  
   **Alternative:** React Hook Form or Formik (acceptable if already in stack; not required for this change).

3. **Service layer (candidateService, uploadService)**  
   **Decision:** Dedicated modules: `candidateService.createCandidate(data)`, `uploadService.uploadFile(file)` using axios; base URL from env (e.g. REACT_APP_API_URL).  
   **Rationale:** Clear boundary for API calls; easy to mock in tests; aligns with proposal.

4. **Component structure**  
   **Decision:** AddCandidatePage (or page component) renders AddCandidateForm; form composes profile fields, EducationFields (repeatable), ExperienceFields (repeatable), and a FileInput (or inline file input).  
   **Rationale:** Matches proposal file list; keeps form testable and reusable.

5. **Routing and entry point**  
   **Decision:** Route e.g. `/add-candidate` or `/candidates/new`; link in app shell (header or home) so "Add Candidate" is reachable.  
   **Rationale:** Fulfills accessibility and discovery; exact path is implementation detail.

6. **Date inputs**  
   **Decision:** Native date input or React DatePicker if already in project; store ISO date strings for API.  
   **Rationale:** Backend expects dates; avoid adding a new dependency if not present.

## Risks / Trade-offs

- **Risk:** Validation drift between frontend and backend → **Mitigation:** Mirror rules from api-spec and backend validation (Zod); document rules in spec; component tests for each rule.
- **Risk:** Large form re-renders → **Mitigation:** Keep state shape flat; validate on blur/submit rather than every keystroke if needed.
- **Risk:** File upload before submit can leave orphan files if user abandons → **Mitigation:** Acceptable for MVP; backend can add cleanup job later if needed.

## Migration Plan

No backend or data migration. Frontend: add route and components; deploy with existing backend. Rollback: remove route and Add Candidate entry point; no data impact.

## Open Questions

- None. Optional: add React Hook Form later for larger forms if maintainability demands it.
