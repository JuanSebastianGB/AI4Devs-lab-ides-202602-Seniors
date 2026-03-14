import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import { app } from '../index';
import { UPLOAD_DIR } from '../config/upload';

const PDF_MAGIC = Buffer.from('%PDF-1.4');
const minimalPdf = Buffer.concat([
  PDF_MAGIC,
  Buffer.from('\n% fake body\n'),
]);

describe('POST /upload', () => {
  it('returns 200 with filePath and fileType for valid PDF and stores file on disk', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', minimalPdf, { filename: 'resume.pdf', contentType: 'application/pdf' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.filePath).toBeDefined();
    expect(res.body.fileType).toBe('application/pdf');

    const fullPath = path.join(UPLOAD_DIR, res.body.filePath);
    expect(fs.existsSync(fullPath)).toBe(true);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  it('returns 400 for wrong file type', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('not a pdf'), {
        filename: 'image.png',
        contentType: 'image/png',
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_FILE');
  });
});

describe('Security and error handling', () => {
  it('rejects path traversal in filename or returns safe path', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', minimalPdf, {
        filename: '../../../etc/passwd.pdf',
        contentType: 'application/pdf',
      })
      .set('Accept', 'application/json');

    if (res.status === 400) {
      expect(res.body.code).toBeDefined();
    } else {
      expect(res.status).toBe(200);
      expect(res.body.filePath).not.toContain('..');
    }
  });

  it('500 response does not leak internal details', async () => {
    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'X',
        lastName: 'Y',
        email: 'valid@example.com',
        educations: [
          {
            institution: 'Uni',
            title: 'T',
            startDate: 'invalid-date-that-crashes',
            endDate: null,
          },
        ],
      })
      .set('Accept', 'application/json');

    if (res.status === 500) {
      expect(res.body.message).toBe('Something went wrong');
      expect(res.body.stack).toBeUndefined();
    }
  });
});
