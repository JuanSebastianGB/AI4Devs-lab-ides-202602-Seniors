## 1. Setup and dependencies

- [x] 1.1 Add React Bootstrap and React Router DOM to frontend if not present; ensure REACT_APP_API_URL is documented or used
- [x] 1.2 Create frontend/src/types/candidate.ts with CreateCandidateRequest, CreateEducationRequest, CreateWorkExperienceRequest, CreateResumeRequest (cv), CreateCandidateResponse aligned with api-spec

## 2. Services

- [x] 2.1 Implement uploadService.uploadFile(file) calling POST /upload with FormData; return filePath and fileType; handle 400/500 with typed errors
- [x] 2.2 Implement candidateService.createCandidate(data) calling POST /candidates with JSON; return CreateCandidateResponse; handle 4xx/5xx

## 3. Form subcomponents

- [x] 3.1 Create EducationFields component (institution, title, startDate, endDate) with visible labels; support add/remove when used in list (max 3)
- [x] 3.2 Create ExperienceFields component (company, position, description, startDate, endDate) with visible labels; support add/remove when used in list
- [x] 3.3 Create FileInput component (or inline) with accept PDF/DOCX, max 10MB, label, error display, and aria-label

## 4. AddCandidateForm and validation

- [x] 4.1 Add AddCandidateForm with controlled state for profile (firstName, lastName, email, phone, address), educations array (max 3), workExperiences array, and optional cv (filePath, fileType)
- [x] 4.2 Implement client-side validation for profile (required names 2–100 letters, email format, optional phone Spanish format, address max 100) and set errors in state; show inline or summary messages
- [x] 4.3 Implement validation for education entries (institution max 100, title max 250, startDate required, endDate optional) and work experience (company/position max 100, description max 200, startDate required, endDate optional); disable or block submit when invalid
- [x] 4.4 Enforce max 3 education entries in UI (add button disabled at 3 or validation on submit)

## 5. Page, routing, and app shell

- [x] 5.1 Create AddCandidatePage that renders AddCandidateForm and wires candidateService and uploadService
- [x] 5.2 Add route for Add Candidate page (e.g. /add-candidate) in App.tsx (or router config)
- [x] 5.3 Add "Add Candidate" entry point in app shell (header or home) that navigates to the Add Candidate route

## 6. Upload flow integration

- [x] 6.1 On file selection, validate type (PDF/DOCX) and size (≤10MB); if invalid show error and do not call upload
- [x] 6.2 On valid file selection, call uploadService.uploadFile and store filePath and fileType in form state; on error show message

## 7. Submit and response handling

- [x] 7.1 On form submit, build CreateCandidateRequest (include cv if upload succeeded) and call candidateService.createCandidate
- [x] 7.2 On 201 show success message and optionally redirect; on 4xx/5xx display backend error or validation details in Alert or inline

## 8. Accessibility

- [x] 8.1 Use semantic HTML (form, fieldset, legend where appropriate); ensure all inputs have visible labels and errors use aria-describedby; add aria-label on file input and icon-only buttons
- [x] 8.2 Verify keyboard navigation (tab order, no focus trap) and that Add Candidate entry point is keyboard-focusable

## 9. Component tests

- [x] 9.1 Add tests for validation: invalid email, name length/pattern, phone format, max 3 educations, file type/size; assert submit disabled or blocked and error messages shown
- [x] 9.2 Add tests for submit: valid payload calls createCandidate with correct CreateCandidateRequest (including optional cv); API error results in error display (mock candidateService and uploadService)
