import request from 'supertest';
import prisma from '../index';
import { app } from '../index';

/**
 * Requires DATABASE_URL and a DB that matches prisma/schema.prisma (Candidate without updatedAt).
 * If your DB has an updatedAt column, add it to the schema with @updatedAt and run a migration.
 */
describe('POST /candidates', () => {
  afterEach(async () => {
    await prisma.resume.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});
  });

  it('returns 201 and CreateCandidateResponse when body is valid and persists in DB', async () => {
    const body = {
      firstName: 'John',
      lastName: 'Doe',
      email: `john.${Date.now()}@example.com`,
      phone: '612345678',
      address: 'Madrid',
      educations: [
        { institution: 'Uni', title: 'CS', startDate: '2020-01-01', endDate: '2024-01-01' },
      ],
      workExperiences: [
        { company: 'Acme', position: 'Dev', startDate: '2024-01-01' },
      ],
    };

    const res = await request(app).post('/candidates').send(body).set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      address: body.address,
    });
    expect(res.body.id).toBeDefined();

    const candidate = await prisma.candidate.findUnique({
      where: { id: res.body.id },
      include: { educations: true, workExperiences: true },
    });
    expect(candidate).not.toBeNull();
    expect(candidate?.educations).toHaveLength(1);
    expect(candidate?.workExperiences).toHaveLength(1);
  });

  it('returns 400 with validation details when body is invalid', async () => {
    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'J',
        lastName: 'Doe',
        email: 'not-an-email',
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('returns 409 when email already exists', async () => {
    const email = `dup.${Date.now()}@example.com`;
    await request(app)
      .post('/candidates')
      .send({ firstName: 'First', lastName: 'User', email })
      .set('Accept', 'application/json');

    const res = await request(app)
      .post('/candidates')
      .send({ firstName: 'Second', lastName: 'User', email })
      .set('Accept', 'application/json');

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE_EMAIL');
  });
});
