import path from 'node:path';
import { buildFileUploadResponse } from './uploadService';
import { UPLOAD_DIR } from '../config/upload';

describe('uploadService', () => {
  it('returns filePath as path relative to UPLOAD_DIR and fileType from mimetype', () => {
    const fullPath = path.join(UPLOAD_DIR, '2024', 'abc-123.pdf');
    const response = buildFileUploadResponse({
      path: fullPath,
      mimetype: 'application/pdf',
    });
    expect(response.fileType).toBe('application/pdf');
    expect(response.filePath).toMatch(/2024[/\\]abc-123\.pdf$/);
  });

  it('uses forward slashes in filePath for API consistency on Windows', () => {
    const fullPath = path.join(UPLOAD_DIR, '2024', 'uuid.docx');
    const response = buildFileUploadResponse({
      path: fullPath,
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(response.fileType).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(response.filePath).not.toContain('\\');
    expect(response.filePath).toContain('/');
  });
});
