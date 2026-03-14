import { Request, Response } from 'express';
import { buildFileUploadResponse } from '../../application/uploadService';

export function createUploadController() {
  return (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded',
        code: 'MISSING_FILE',
      });
      return;
    }

    const response = buildFileUploadResponse({
      path: req.file.path,
      mimetype: req.file.mimetype,
    });
    res.status(200).json(response);
  };
}
