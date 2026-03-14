import { CandidateService } from './candidateService';
import { CandidateRepository } from '../../domain/repositories/CandidateRepository';
import { Candidate } from '@prisma/client';

describe('CandidateService', () => {
  const mockCreate = jest.fn();
  const mockFindByEmail = jest.fn();

  const mockRepo: CandidateRepository = {
    create: mockCreate,
    findByEmail: mockFindByEmail,
  };

  const service = new CandidateService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates candidate and returns CreateCandidateResponse when email is unique', async () => {
    mockFindByEmail.mockResolvedValue(null);
    const created: Candidate = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: null,
      address: null,
    };
    mockCreate.mockResolvedValue(created);

    const result = await service.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    expect(mockFindByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockCreate).toHaveBeenCalled();
    expect(result).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: null,
      address: null,
    });
  });

  it('throws with code DUPLICATE_EMAIL when email already exists', async () => {
    mockFindByEmail.mockResolvedValue({
      id: 1,
      firstName: 'Existing',
      lastName: 'User',
      email: 'existing@example.com',
      phone: null,
      address: null,
    });

    await expect(
      service.create({
        firstName: 'New',
        lastName: 'User',
        email: 'existing@example.com',
      })
    ).rejects.toMatchObject({ code: 'DUPLICATE_EMAIL' });

    expect(mockCreate).not.toHaveBeenCalled();
  });
});
