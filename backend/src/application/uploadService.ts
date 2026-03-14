import path from 'node:path';
import { UPLOAD_DIR } from '../config/upload';

export interface FileUploadResponse {
  filePath: string;
  fileType: string;
}

export interface MulterFile {
  path: string;
  mimetype: string;
}

/**
 * Builds the API response for an uploaded file.
 * File is already stored by multer with a safe name; we return relative path and MIME type.
 */
export function buildFileUploadResponse(file: MulterFile): FileUploadResponse {
  const relativePath = path.relative(UPLOAD_DIR, file.path);
  const filePath = path.sep === '\\' ? relativePath.replace(/\\/g, '/') : relativePath;
  return {
    filePath,
    fileType: file.mimetype,
  };
}
