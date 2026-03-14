## 1. Schema

- [x] 1.1 Add Candidate model to schema.prisma (id, firstName, lastName, email, phone, address with @db.VarChar lengths per data-model.md)
- [x] 1.2 Add Education, WorkExperience, and Resume models with candidateId relations and onDelete Cascade
- [x] 1.3 Define both sides of relations (Candidate ↔ Education, WorkExperience, Resume); keep User model unchanged

## 2. Migration and validation

- [x] 2.1 Run `npx prisma migrate dev --name add_candidate_aggregate` and fix any migration or SQL issues
- [x] 2.2 Run `npx prisma validate` and resolve any errors
- [x] 2.3 Run `npx prisma generate` and confirm client generates without errors
- [x] 2.4 Verify migration SQL does not alter or drop User table; document rollback approach if required by project
