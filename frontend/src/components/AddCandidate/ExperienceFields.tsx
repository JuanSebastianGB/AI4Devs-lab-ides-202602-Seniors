import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { CreateWorkExperienceRequest } from '../../types/candidate';

export interface ExperienceFieldsProps {
  value: CreateWorkExperienceRequest;
  onChange: (value: CreateWorkExperienceRequest) => void;
  onRemove?: () => void;
  showRemove: boolean;
  index: number;
  error?: string;
  describedById?: string;
}

export function ExperienceFields({
  value,
  onChange,
  onRemove,
  showRemove,
  index,
  error,
  describedById,
}: ExperienceFieldsProps): React.ReactElement {
  const fieldId = (name: string) => `experience-${index}-${name}`;

  return (
    <fieldset aria-describedby={error && describedById ? describedById : undefined}>
      <legend className="visually-hidden">Work experience {index + 1}</legend>
      <Row className="mb-2">
        <Col>
          <Form.Group className="mb-2">
            <Form.Label htmlFor={fieldId('company')}>Company</Form.Label>
            <Form.Control
              id={fieldId('company')}
              type="text"
              value={value.company}
              onChange={(e) => onChange({ ...value, company: e.target.value })}
              maxLength={101}
              isInvalid={!!error}
              aria-describedby={error && describedById ? describedById : undefined}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-2">
            <Form.Label htmlFor={fieldId('position')}>Position</Form.Label>
            <Form.Control
              id={fieldId('position')}
              type="text"
              value={value.position}
              onChange={(e) => onChange({ ...value, position: e.target.value })}
              maxLength={101}
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-2">
        <Form.Label htmlFor={fieldId('description')}>Description (optional)</Form.Label>
        <Form.Control
          id={fieldId('description')}
          as="textarea"
          rows={2}
          value={value.description ?? ''}
          onChange={(e) => onChange({ ...value, description: e.target.value || null })}
          maxLength={201}
        />
      </Form.Group>
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
          aria-label={`Remove work experience ${index + 1}`}
        >
          Remove experience
        </Button>
      )}
    </fieldset>
  );
}
