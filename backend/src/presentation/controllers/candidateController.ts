import { Request, Response } from 'express';
import { createCandidateRequestSchema } from '../../application/schemas/candidateSchemas';
import { CandidateService } from '../../application/services/candidateService';

export function createCandidateController(service: CandidateService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = createCandidateRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues.map((e) => ({
            field: e.path.map(String).join('.'),
            message: e.message,
          })),
        });
        return;
      }

      const candidate = await service.create(parsed.data);
      res.status(201).json(candidate);
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      if (code === 'DUPLICATE_EMAIL') {
        res.status(409).json({
          message: 'Email already exists',
          code: 'DUPLICATE_EMAIL',
        });
        return;
      }
      throw err;
    }
  };
}
