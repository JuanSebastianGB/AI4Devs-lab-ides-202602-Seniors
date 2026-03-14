## ADDED Requirements

### Requirement: Candidate aggregate is persisted in the database

The system SHALL persist the Candidate aggregate (Candidate, Education, WorkExperience, Resume) using Prisma models and a single migration. Schema MUST align with `ai-specs/specs/data-model.md` and the CreateCandidateRequest / Education / WorkExperience / Resume shapes in `ai-specs/specs/api-spec.yml`.

#### Scenario: Prisma schema defines Candidate model with required fields and lengths
- **WHEN** the Prisma schema is inspected
- **THEN** a Candidate model exists with id (autoincrement), firstName (VarChar 100), lastName (VarChar 100), email (unique, VarChar 255), phone (optional, VarChar 15), address (optional, VarChar 100)

#### Scenario: Prisma schema defines Education, WorkExperience, and Resume with relations
- **WHEN** the Prisma schema is inspected
- **THEN** Education, WorkExperience, and Resume models exist with candidateId foreign keys and onDelete Cascade to Candidate; field lengths match data-model.md (e.g. institution 100, title 250, company/position 100, description 200, filePath 500, fileType 50)

#### Scenario: Migration applies successfully without changing User
- **WHEN** `npx prisma migrate dev --name add_candidate_aggregate` is run
- **THEN** a new migration is created and applied; existing User table and prior migrations are unchanged

#### Scenario: Schema validation passes
- **WHEN** `npx prisma validate` is run
- **THEN** validation passes with no errors

#### Scenario: No Application model or applications relation in this change
- **WHEN** the Prisma schema is inspected
- **THEN** Candidate has no `applications` relation; Application model is not present (deferred to a later change)
