import { PrismaClient } from '@prisma/client';
import { PrismaCandidateRepository } from './PrismaCandidateRepository';

const prisma = new PrismaClient();
const repo = new PrismaCandidateRepository(prisma);

describe('PrismaCandidateRepository', () => {
  afterEach(async () => {
    await prisma.resume.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates candidate with related education, work experience and resume in transaction', async () => {
    const data = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `jane.smith.${Date.now()}@example.com`,
      phone: '612345678',
      address: 'Madrid',
      educations: [
        {
          institution: 'University of Test',
          title: 'Computer Science',
          startDate: new Date('2020-09-01'),
          endDate: new Date('2024-06-01'),
        },
      ],
      workExperiences: [
        {
          company: 'Acme Corp',
          position: 'Developer',
          description: 'Backend work',
          startDate: new Date('2024-01-01'),
          endDate: null,
        },
      ],
      cv: { filePath: 'uploads/2024/uuid.pdf', fileType: 'application/pdf' },
    };

    const candidate = await repo.create(data);

    expect(candidate.id).toBeDefined();
    expect(candidate.firstName).toBe(data.firstName);
    expect(candidate.email).toBe(data.email);

    const withRelations = await prisma.candidate.findUnique({
      where: { id: candidate.id },
      include: { educations: true, workExperiences: true, resumes: true },
    });
    expect(withRelations?.educations).toHaveLength(1);
    expect(withRelations?.workExperiences).toHaveLength(1);
    expect(withRelations?.resumes).toHaveLength(1);
    expect(withRelations?.resumes?.[0].filePath).toBe(data.cv.filePath);
  });

  it('throws on duplicate email and does not leave partial data', async () => {
    const email = `dup.${Date.now()}@example.com`;
    await repo.create({
      firstName: 'First',
      lastName: 'User',
      email,
    });

    await expect(
      repo.create({
        firstName: 'Second',
        lastName: 'User',
        email,
      })
    ).rejects.toThrow();

    const count = await prisma.candidate.count({ where: { email } });
    expect(count).toBe(1);
  });
});
