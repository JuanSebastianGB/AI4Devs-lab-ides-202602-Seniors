import { CandidateRepository } from '../../domain/repositories/CandidateRepository';
import { CreateCandidateRequest } from '../schemas/candidateSchemas';

export interface CreateCandidateResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export class CandidateService {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async create(data: CreateCandidateRequest): Promise<CreateCandidateResponse> {
    const existing = await this.candidateRepository.findByEmail(data.email);
    if (existing) {
      const error = new Error('Email already exists');
      (error as Error & { code?: string }).code = 'DUPLICATE_EMAIL';
      throw error;
    }

    const candidate = await this.candidateRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      address: data.address ?? null,
      educations: data.educations?.map((e) => ({
        institution: e.institution,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate ?? null,
      })),
      workExperiences: data.workExperiences?.map((w) => ({
        company: w.company,
        position: w.position,
        description: w.description ?? null,
        startDate: w.startDate,
        endDate: w.endDate ?? null,
      })),
      cv: data.cv ?? null,
    });

    return {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone ?? null,
      address: candidate.address ?? null,
    };
  }
}
