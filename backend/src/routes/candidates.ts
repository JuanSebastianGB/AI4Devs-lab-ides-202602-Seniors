import { Router } from 'express';
import { createCandidateController } from '../presentation/controllers/candidateController';
import { CandidateService } from '../application/services/candidateService';

export function createCandidatesRouter(candidateService: CandidateService): Router {
  const router = Router();
  router.post('/', createCandidateController(candidateService));
  return router;
}
