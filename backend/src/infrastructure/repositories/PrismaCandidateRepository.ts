import { PrismaClient } from '@prisma/client';
import {
  CandidateRepository,
  CreateCandidateData,
} from '../../domain/repositories/CandidateRepository';

export class PrismaCandidateRepository implements CandidateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateCandidateData) {
    return this.prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone ?? null,
          address: data.address ?? null,
          educations: data.educations?.length
            ? {
                create: data.educations.map((e) => ({
                  institution: e.institution,
                  title: e.title,
                  startDate: e.startDate,
                  endDate: e.endDate ?? null,
                })),
              }
            : undefined,
          workExperiences: data.workExperiences?.length
            ? {
                create: data.workExperiences.map((w) => ({
                  company: w.company,
                  position: w.position,
                  description: w.description ?? null,
                  startDate: w.startDate,
                  endDate: w.endDate ?? null,
                })),
              }
            : undefined,
          resumes: data.cv
            ? {
                create: {
                  filePath: data.cv.filePath,
                  fileType: data.cv.fileType,
                },
              }
            : undefined,
        },
      });
      return candidate;
    });
  }

  async findByEmail(email: string) {
    return this.prisma.candidate.findUnique({ where: { email } });
  }
}
