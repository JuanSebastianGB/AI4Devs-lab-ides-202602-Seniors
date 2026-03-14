import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { CreateEducationRequest } from '../../types/candidate';

const MAX_EDUCATIONS = 3;

export interface EducationFieldsProps {
  value: CreateEducationRequest;
  onChange: (value: CreateEducationRequest) => void;
  onRemove?: () => void;
  showRemove: boolean;
  index: number;
  error?: string;
  /** id prefix for aria-describedby when error is shown */
  describedById?: string;
}

export function EducationFields({
  value,
  onChange,
  onRemove,
  showRemove,
  index,
  error,
  describedById,
}: EducationFieldsProps): React.ReactElement {
  const fieldId = (name: string) => `education-${index}-${name}`;

  return (
    <fieldset aria-describedby={error && describedById ? describedById : undefined}>
      <legend className="visually-hidden">Education {index + 1}</legend>
      <Row className="mb-2">
        <Col>
          <Form.Group className="mb-2">
            <Form.Label htmlFor={fieldId('institution')}>Institution</Form.Label>
            <Form.Control
              id={fieldId('institution')}
              type="text"
              value={value.institution}
              onChange={(e) => onChange({ ...value, institution: e.target.value })}
              maxLength={101}
              isInvalid={!!error}
              aria-describedby={error && describedById ? describedById : undefined}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-2">
            <Form.Label htmlFor={fieldId('title')}>Title / Degree</Form.Label>
            <Form.Control
              id={fieldId('title')}
              type="text"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              maxLength={251}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Group className="mb-2">
            <Form.Label htmlFor={fieldId('startDate')}>Start date</Form.Label>
            <Form.Control
              id={fieldId('startDate')}
              type="date"
              value={value.startDate ? value.startDate.slice(0, 10) : ''}
              onChange={(e) =>
                onChange({ ...value, startDate: e.target.value ? `${e.target.value}T00:00:00.000Z` : '' })
              }
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-2">
            <Form.Label htmlFor={fieldId('endDate')}>End date (optional)</Form.Label>
            <Form.Control
              id={fieldId('endDate')}
              type="date"
              value={value.endDate ? value.endDate.slice(0, 10) : ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  endDate: e.target.value ? `${e.target.value}T00:00:00.000Z` : null,
                })
              }
            />
          </Form.Group>
        </Col>
      </Row>
      {showRemove && (
        <Button
          type="button"
          variant="outline-danger"
          size="sm"
          onClick={onRemove}
          aria-label={`Remove education ${index + 1}`}
        >
          Remove education
        </Button>
      )}
    </fieldset>
  );
}

export { MAX_EDUCATIONS };
