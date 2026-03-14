import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { PrismaCandidateRepository } from './infrastructure/repositories/PrismaCandidateRepository';
import { CandidateService } from './application/services/candidateService';
import { createCandidatesRouter } from './routes/candidates';
import { createUploadRouter } from './routes/upload';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = Number(process.env.PORT) || 3010;

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

const candidateRepository = new PrismaCandidateRepository(prisma);
const candidateService = new CandidateService(candidateRepository);
app.use('/candidates', createCandidatesRouter(candidateService));
app.use('/upload', createUploadRouter());

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const multerErr = err as { code?: string; message?: string };
  if (multerErr.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'File too large', code: 'FILE_TOO_LARGE' });
    return;
  }
  if (
    multerErr.code === 'LIMIT_FILE_COUNT' ||
    multerErr.message?.includes('path traversal') ||
    multerErr.message?.includes('Only PDF')
  ) {
    res.status(400).json({ message: multerErr.message || 'Invalid file', code: 'INVALID_FILE' });
    return;
  }
  res.status(500).json({ message: 'Something went wrong' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
