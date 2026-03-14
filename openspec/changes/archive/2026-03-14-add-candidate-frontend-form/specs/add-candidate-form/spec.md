## ADDED Requirements

### Requirement: Add Candidate page is reachable via route and app shell

The application SHALL expose a route (e.g. `/add-candidate` or `/candidates/new`) that renders the Add Candidate form. The application SHALL provide an entry point from the app shell (e.g. link in header or home) so that the Add Candidate page is reachable without typing the URL.

#### Scenario: Route renders Add Candidate form
- **WHEN** the user navigates to the Add Candidate route
- **THEN** the Add Candidate form is displayed with profile, education, work experience, and CV upload sections

#### Scenario: Add Candidate is reachable from app shell
- **WHEN** the user is on any page that includes the app shell
- **THEN** an "Add Candidate" (or equivalent) link or control is visible and keyboard-focusable
- **AND** activating it navigates to the Add Candidate page

### Requirement: Form collects profile, education, work experience, and optional CV

The Add Candidate form SHALL collect: firstName, lastName, email (required); phone, address (optional); up to 3 education entries (institution, title, startDate, endDate optional per entry); one or more work experience entries (company, position, description optional, startDate, endDate optional); and an optional file input for CV (PDF or DOCX, max 10MB). The form SHALL allow adding and removing education and work experience rows within these limits.

#### Scenario: Form includes all required profile fields
- **WHEN** the Add Candidate form is displayed
- **THEN** inputs for firstName, lastName, and email are present and associated with visible labels

#### Scenario: Form allows up to 3 education entries
- **WHEN** the Add Candidate form is displayed
- **THEN** at least one education block is present (institution, title, startDate, endDate)
- **AND** the user can add more education blocks up to a maximum of 3
- **AND** the user can remove education blocks while at least one remains or as allowed by product

#### Scenario: Form allows one or more work experience entries
- **WHEN** the Add Candidate form is displayed
- **THEN** at least one work experience block is present (company, position, description, startDate, endDate)
- **AND** the user can add more work experience blocks
- **AND** the user can remove work experience blocks while at least one remains

#### Scenario: CV file input accepts PDF and DOCX only
- **WHEN** the Add Candidate form is displayed
- **THEN** an optional file input is present that accepts PDF and DOCX (e.g. accept attribute or equivalent)
- **AND** the input has a visible label and is usable with keyboard and screen reader

### Requirement: Client-side validation mirrors backend rules

The form SHALL validate input before submit using rules that mirror the backend: firstName and lastName required, 2–100 characters, letters-only; email required, valid email format; phone optional, if present Spanish format (6|7|9) plus 8 digits; address optional, max 100 characters; each education: institution max 100, title max 250, startDate required, endDate optional; each work experience: company and position max 100, description max 200, startDate required, endDate optional. The form SHALL display inline or summary validation messages and SHALL disable or block submit when validation fails.

#### Scenario: Invalid profile shows validation messages
- **WHEN** the user enters an invalid firstName (e.g. too short, numbers, or empty) or invalid email
- **THEN** a validation message is shown for the affected field(s)
- **AND** submit is disabled or the submit action is blocked until the error is fixed

#### Scenario: Invalid education or experience shows validation messages
- **WHEN** an education or work experience entry has missing required fields (e.g. startDate) or exceeds length limits
- **THEN** validation messages are shown for the affected fields
- **AND** submit is disabled or blocked until errors are fixed

#### Scenario: More than 3 education entries is prevented or rejected
- **WHEN** the user attempts to add a fourth education entry (or submits with more than 3)
- **THEN** the form prevents adding more than 3 or shows a validation error
- **AND** submit is disabled or blocked when there are more than 3 education entries

### Requirement: CV upload uses two-step flow

The form SHALL use a two-step flow for CV: when the user selects a valid file (PDF or DOCX, ≤10MB), the application SHALL call POST /upload with the file and SHALL store the returned filePath and fileType. On form submit, the application SHALL include in the POST /candidates body the optional `cv: { filePath, fileType }` if an upload succeeded. The application SHALL NOT send the raw file in the JSON body. The application SHALL validate file type and size before calling upload and SHALL show a clear error for wrong type or size without calling create.

#### Scenario: Valid file is uploaded and cv included on submit
- **WHEN** the user selects a valid PDF or DOCX file (≤10MB) and submits the form with valid data
- **THEN** POST /upload was called with the file (or upload occurred on selection) and filePath/fileType were stored
- **AND** POST /candidates is called with a body including cv: { filePath, fileType }

#### Scenario: Invalid file type or size shows error without calling create
- **WHEN** the user selects a file that is not PDF/DOCX or is over 10MB
- **THEN** the application shows a clear error message (type or size)
- **AND** POST /upload is not called with that file (or error is shown and create is not called with invalid upload)

### Requirement: Submit sends CreateCandidateRequest and handles response

On submit, the application SHALL build a request body conforming to CreateCandidateRequest (per api-spec) and SHALL call POST /candidates. On 201, the application SHALL show a success message and MAY redirect (e.g. to candidate list or detail). On 4xx or 5xx, the application SHALL display backend error or validation details (e.g. validation details array) in an Alert or inline.

#### Scenario: Valid submit creates candidate and shows success
- **WHEN** the user submits the form with valid data (with or without CV)
- **THEN** POST /candidates is called with a valid CreateCandidateRequest body
- **AND** on 201 the user sees a success message and optionally is redirected

#### Scenario: API validation or error is displayed
- **WHEN** POST /candidates returns 400, 409, or 5xx
- **THEN** the application displays the backend error or validation details to the user (e.g. in an Alert or inline)
- **AND** the user can correct the form and resubmit where applicable

### Requirement: Add Candidate form is accessible

The Add Candidate form SHALL use semantic HTML (form, fieldset, legend where appropriate). All inputs SHALL have visible labels. The file input and icon-only buttons SHALL have aria-label or equivalent. Error messages SHALL be associated with fields (e.g. aria-describedby). The form SHALL be keyboard navigable (tab order, no focus trap). The Add Candidate entry point SHALL be reachable from the app shell.

#### Scenario: Form is keyboard navigable
- **WHEN** the user navigates using only the keyboard (Tab, Enter, etc.)
- **THEN** all form controls and the Add Candidate entry point can be reached and operated
- **AND** no focus trap prevents leaving the form or page

#### Scenario: Errors are announced to screen readers
- **WHEN** validation errors are shown
- **THEN** error messages are associated with the relevant fields (e.g. aria-describedby)
- **AND** labels and errors are programmatically associated so screen readers can announce them

### Requirement: Add Candidate form has component tests

The application SHALL include component tests that cover: validation rules (required fields, lengths, email/phone format, max 3 educations); file type/size feedback; submit disabled or blocked when invalid; submit calling createCandidate with the correct payload when valid; and display of API error (400/409/500). Services (candidateService, uploadService) SHALL be mocked in tests.

#### Scenario: Validation tests exist
- **WHEN** the test suite runs
- **THEN** there are tests that assert invalid email, invalid name length or pattern, invalid phone format, and more than 3 educations result in validation messages and submit is disabled or blocked

#### Scenario: Submit tests exist
- **WHEN** the test suite runs
- **THEN** there are tests that assert valid submit calls createCandidate with a payload matching CreateCandidateRequest (including optional cv)
- **AND** there are tests that assert API error responses result in error display
