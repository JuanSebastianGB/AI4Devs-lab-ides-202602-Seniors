import { Candidate } from '@prisma/client';

export interface CreateCandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  educations?: Array<{
    institution: string;
    title: string;
    startDate: Date;
    endDate?: Date | null;
  }>;
  workExperiences?: Array<{
    company: string;
    position: string;
    description?: string | null;
    startDate: Date;
    endDate?: Date | null;
  }>;
  cv?: { filePath: string; fileType: string } | null;
}

export interface CandidateRepository {
  create(data: CreateCandidateData): Promise<Candidate>;
  findByEmail(email: string): Promise<Candidate | null>;
}
