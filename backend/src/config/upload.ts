import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIMES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

function getExtensionFromMime(mimetype: string): string | null {
  return ALLOWED_MIMES[mimetype] ?? null;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const year = new Date().getFullYear().toString();
    const dir = path.join(UPLOAD_DIR, year);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = getExtensionFromMime(file.mimetype) || 'bin';
    const safeName = `${randomUUID()}.${ext}`;
    cb(null, safeName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.originalname?.includes('..')) {
      return cb(new Error('Path traversal in filename is not allowed'));
    }
    if (!getExtensionFromMime(file.mimetype)) {
      return cb(new Error('Only PDF and DOCX files are allowed'));
    }
    cb(null, true);
  },
});
export { UPLOAD_DIR };
