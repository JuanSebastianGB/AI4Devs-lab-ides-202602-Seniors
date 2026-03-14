-- CreateTable (IF NOT EXISTS for idempotent re-apply after resolve --rolled-back)
CREATE TABLE IF NOT EXISTS "Candidate" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15),
    "address" VARCHAR(100),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Education" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "institution" VARCHAR(100) NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WorkExperience" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "company" VARCHAR(100) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "description" VARCHAR(200),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Resume" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(50) NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (IF NOT EXISTS for idempotent re-apply)
CREATE UNIQUE INDEX IF NOT EXISTS "Candidate_email_key" ON "Candidate"("email");

CREATE INDEX IF NOT EXISTS "Education_candidateId_idx" ON "Education"("candidateId");

CREATE INDEX IF NOT EXISTS "WorkExperience_candidateId_idx" ON "WorkExperience"("candidateId");

CREATE INDEX IF NOT EXISTS "Resume_candidateId_idx" ON "Resume"("candidateId");

-- AddForeignKey (ignore if constraint already exists)
DO $$
BEGIN
  ALTER TABLE "Education" ADD CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Resume" ADD CONSTRAINT "Resume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
