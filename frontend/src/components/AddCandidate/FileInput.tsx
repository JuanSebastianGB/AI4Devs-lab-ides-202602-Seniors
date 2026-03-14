import React from 'react';
import { Form } from 'react-bootstrap';

const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export interface FileInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  id?: string;
  describedById?: string;
}

export function FileInput({
  value,
  onChange,
  error,
  id = 'cv-file',
  describedById,
}: FileInputProps): React.ReactElement {
  return (
    <Form.Group>
      <Form.Label htmlFor={id}>CV (PDF or DOCX, max 10MB, optional)</Form.Label>
      <Form.Control
        id={id}
        type="file"
        accept={ACCEPT}
        onChange={(e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            onChange(file);
          } else {
            onChange(null);
          }
        }}
        isInvalid={!!error}
        aria-label="Choose CV file (PDF or DOCX, max 10MB)"
        aria-describedby={error && describedById ? describedById : undefined}
      />
      {error && (
        <Form.Control.Feedback type="invalid" id={describedById}>
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}

export { ACCEPT, MAX_SIZE_BYTES };
