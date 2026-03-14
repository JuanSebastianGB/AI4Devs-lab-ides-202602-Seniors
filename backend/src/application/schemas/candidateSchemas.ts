import { z } from 'zod';

const lettersOnly = /^[a-zA-Z\s\-']+$/;
const spanishPhone = /^[679]\d{8}$/;

export const createEducationRequestSchema = z.object({
  institution: z.string().min(1).max(100),
  title: z.string().min(1).max(250),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
});

export const createWorkExperienceRequestSchema = z.object({
  company: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  description: z.string().max(200).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
});

export const createResumeRequestSchema = z.object({
  filePath: z.string().min(1),
  fileType: z.string().min(1),
});

export const createCandidateRequestSchema = z.object({
  firstName: z.string().min(2).max(100).regex(lettersOnly),
  lastName: z.string().min(2).max(100).regex(lettersOnly),
  email: z.string().email(),
  phone: z.string().regex(spanishPhone).optional().nullable(),
  address: z.string().max(100).optional().nullable(),
  educations: z.array(createEducationRequestSchema).max(3).optional(),
  workExperiences: z.array(createWorkExperienceRequestSchema).optional(),
  cv: createResumeRequestSchema.optional().nullable(),
});

export type CreateCandidateRequest = z.infer<typeof createCandidateRequestSchema>;
export type CreateEducationRequest = z.infer<typeof createEducationRequestSchema>;
export type CreateWorkExperienceRequest = z.infer<typeof createWorkExperienceRequestSchema>;
export type CreateResumeRequest = z.infer<typeof createResumeRequestSchema>;
