import {
  createCandidateRequestSchema,
  createEducationRequestSchema,
} from './candidateSchemas';

const validBase = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
};

describe('createCandidateRequestSchema', () => {
  it('accepts valid minimal payload', () => {
    const result = createCandidateRequestSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('accepts valid payload with optional fields', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      phone: '612345678',
      address: 'Madrid',
      educations: [
        {
          institution: 'University',
          title: 'Degree',
          startDate: '2020-01-01',
          endDate: '2024-01-01',
        },
      ],
      workExperiences: [
        {
          company: 'Acme',
          position: 'Developer',
          startDate: '2024-02-01',
        },
      ],
      cv: { filePath: 'uploads/2024/uuid.pdf', fileType: 'application/pdf' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects firstName too long', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      firstName: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects lastName too short', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      lastName: 'X',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 educations', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      educations: [
        { institution: 'A', title: 'T', startDate: '2020-01-01' },
        { institution: 'B', title: 'T', startDate: '2020-01-01' },
        { institution: 'C', title: 'T', startDate: '2020-01-01' },
        { institution: 'D', title: 'T', startDate: '2020-01-01' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid Spanish phone (must start with 6, 7 or 9 and have 9 digits)', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      phone: '512345678',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid Spanish phone', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      phone: '612345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date in education', () => {
    const result = createCandidateRequestSchema.safeParse({
      ...validBase,
      educations: [
        {
          institution: 'Uni',
          title: 'Degree',
          startDate: 'not-a-date',
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('createEducationRequestSchema', () => {
  it('accepts valid education', () => {
    const result = createEducationRequestSchema.safeParse({
      institution: 'University',
      title: 'Computer Science',
      startDate: '2020-09-01',
      endDate: '2024-06-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects title over 250 chars', () => {
    const result = createEducationRequestSchema.safeParse({
      institution: 'Uni',
      title: 'A'.repeat(251),
      startDate: '2020-01-01',
    });
    expect(result.success).toBe(false);
  });
});
