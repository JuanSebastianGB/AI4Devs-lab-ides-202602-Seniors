## ADDED Requirements

### Requirement: Create candidate endpoint accepts validated JSON and persists aggregate

The system SHALL expose POST /candidates that accepts a JSON body conforming to CreateCandidateRequest (per api-spec.yml). The request SHALL be validated with Zod: firstName and lastName required (2–100 chars, letters-only pattern), email required (email format), phone optional (Spanish format `(6|7|9)\d{8}`), address optional (max 100); educations array optional (max 3 items) with institution, title, startDate, endDate optional; workExperiences array optional with company, position, description optional (max 200), startDate, endDate optional; cv optional with filePath and fileType. On success the system SHALL create Candidate and related Education, WorkExperience, and Resume (if cv provided) in a single transaction and return 201 with CreateCandidateResponse (id, firstName, lastName, email, phone, address).

#### Scenario: Valid request returns 201 and persisted aggregate
- **WHEN** POST /candidates is called with a valid CreateCandidateRequest body (required fields and valid optional nested objects)
- **THEN** the response status is 201 and the body matches CreateCandidateResponse with the created id
- **AND** one Candidate record and the corresponding Education, WorkExperience, and Resume (if cv provided) records exist in the database

#### Scenario: Invalid request returns 400 with structured validation details
- **WHEN** POST /candidates is called with an invalid body (e.g. invalid email, name too long, more than 3 educations, invalid phone format)
- **THEN** the response status is 400
- **AND** the response body includes a validation error structure (e.g. code such as VALIDATION_ERROR and details with field and message)

#### Scenario: Duplicate email returns 400 or 409
- **WHEN** POST /candidates is called with an email that already exists for another candidate
- **THEN** the response status is 400 or 409
- **AND** the response body contains a clear message that the email already exists

#### Scenario: Create candidate uses single transaction
- **WHEN** POST /candidates is called with valid body including educations and workExperiences
- **THEN** Candidate and all related Education and WorkExperience (and Resume if cv provided) are created in one transaction
- **AND** if any part of the creation fails, no partial Candidate or related records are persisted

### Requirement: Create candidate response shape matches API spec

The system SHALL return CreateCandidateResponse with id (integer), firstName, lastName, email, and optionally phone and address, and SHALL NOT expose internal or extended fields in the create response.

#### Scenario: Response contains only allowed fields
- **WHEN** POST /candidates succeeds
- **THEN** the response body contains exactly id, firstName, lastName, email, and optionally phone and address as defined in api-spec.yml CreateCandidateResponse
- **AND** no other fields (e.g. educations, workExperiences, createdAt) are present in the response
