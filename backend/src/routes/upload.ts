import { Router } from 'express';
import { uploadMiddleware } from '../config/upload';
import { createUploadController } from '../presentation/controllers/uploadController';

export function createUploadRouter(): Router {
  const router = Router();
  router.post('/', uploadMiddleware.single('file'), createUploadController());
  return router;
}
