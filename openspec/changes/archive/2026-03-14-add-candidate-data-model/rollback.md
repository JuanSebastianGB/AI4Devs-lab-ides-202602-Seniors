# Rollback for add_candidate_aggregate

- **Migration:** `20260314024438_add_candidate_aggregate`
- **Verification:** The migration SQL only creates `Candidate`, `Education`, `WorkExperience`, and `Resume` tables; it does not alter or drop the `User` table.
- **Rollback:** To mark this migration as rolled back without re-running it (e.g. after manually dropping the new tables), run:
  ```bash
  cd backend && npx prisma migrate resolve --rolled-back 20260314024438_add_candidate_aggregate
  ```
- To fully undo: drop the four new tables in the database, then run the command above, then revert `schema.prisma` to remove the Candidate aggregate models.
