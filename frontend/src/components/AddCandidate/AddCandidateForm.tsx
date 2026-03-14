import React, { useState, useCallback } from 'react';
import { Form, Container, Row, Col, Button, Alert } from 'react-bootstrap';
import {
  CreateCandidateRequest,
  CreateEducationRequest,
  CreateWorkExperienceRequest,
  CreateResumeRequest,
} from '../../types/candidate';
import { createCandidate, getCandidateApiError, ApiError } from '../../services/candidateService';
import { uploadFile, getUploadErrorMessage } from '../../services/uploadService';
import { EducationFields, MAX_EDUCATIONS } from './EducationFields';
import { ExperienceFields } from './ExperienceFields';
import { FileInput, MAX_SIZE_BYTES } from './FileInput';
import * as v from '../../utils/candidateValidation';

const initialEducation = (): CreateEducationRequest => ({
  institution: '',
  title: '',
  startDate: '',
  endDate: null,
});

const initialExperience = (): CreateWorkExperienceRequest => ({
  company: '',
  position: '',
  description: null,
  startDate: '',
  endDate: null,
});

export interface AddCandidateFormProps {
  onSuccess?: () => void;
}

export function AddCandidateForm({ onSuccess }: AddCandidateFormProps): React.ReactElement {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [educations, setEducations] = useState<CreateEducationRequest[]>([initialEducation()]);
  const [workExperiences, setWorkExperiences] = useState<CreateWorkExperienceRequest[]>([initialExperience()]);
  const [cv, setCv] = useState<CreateResumeRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validateProfile = useCallback((): boolean => {
    const e: Record<string, string> = {};
    const fn = v.validateFirstName(firstName);
    if (fn) e.firstName = fn;
    const ln = v.validateLastName(lastName);
    if (ln) e.lastName = ln;
    const em = v.validateEmail(email);
    if (em) e.email = em;
    const ph = v.validatePhone(phone);
    if (ph) e.phone = ph;
    const ad = v.validateAddress(address);
    if (ad) e.address = ad;
    setErrors((prev) => ({ ...prev, ...e }));
    return !(fn || ln || em || ph || ad);
  }, [firstName, lastName, email, phone, address]);

  const validateEducation = useCallback((edu: CreateEducationRequest, index: number): boolean => {
    const inst = v.validateEducationInstitution(edu.institution);
    const title = v.validateEducationTitle(edu.title);
    const start = v.validateEducationStartDate(edu.startDate);
    const key = `education-${index}`;
    const msg = [inst, title, start].filter(Boolean).join(' ');
    setErrors((prev) => ({ ...prev, [key]: msg || '' }));
    return !(inst || title || start);
  }, []);

  const validateExperience = useCallback((exp: CreateWorkExperienceRequest, index: number): boolean => {
    const company = v.validateWorkCompany(exp.company);
    const position = v.validateWorkPosition(exp.position);
    const desc = v.validateWorkDescription(exp.description ?? '');
    const start = v.validateWorkStartDate(exp.startDate);
    const key = `experience-${index}`;
    const msg = [company, position, desc, start].filter(Boolean).join(' ');
    setErrors((prev) => ({ ...prev, [key]: msg || '' }));
    return !(company || position || desc || start);
  }, []);

  const validateAll = useCallback((): boolean => {
    const okProfile = validateProfile();
    let okEdu = true;
    educations.forEach((edu, i) => {
      const filled = edu.institution.trim() !== '' || edu.title.trim() !== '' || (edu.startDate && edu.startDate.trim() !== '');
      if (filled && !validateEducation(edu, i)) okEdu = false;
    });
    let okExp = true;
    workExperiences.forEach((exp, i) => {
      const filled =
        exp.company.trim() !== '' || exp.position.trim() !== '' || (exp.startDate && exp.startDate.trim() !== '');
      if (filled && !validateExperience(exp, i)) okExp = false;
    });
    if (educations.length > MAX_EDUCATIONS) {
      setErrors((prev) => ({ ...prev, educations: 'Maximum 3 education entries allowed' }));
      okEdu = false;
    }
    return okProfile && okEdu && okExp;
  }, [validateProfile, validateEducation, validateExperience, educations, workExperiences]);

  const handleFileChange = useCallback(
    async (file: File | null) => {
      setSelectedFile(file);
      setFileError(undefined);
      setCv(null);
      if (!file) return;
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const okType = allowedTypes.includes(file.type) || /\.(pdf|docx)$/i.test(file.name);
      if (!okType) {
        setFileError('File must be PDF or DOCX');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setFileError('File must be 10MB or smaller');
        return;
      }
      setUploading(true);
      try {
        const result = await uploadFile(file);
        setCv(result);
      } catch (err) {
        setFileError(getUploadErrorMessage(err));
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError(null);
      if (!validateAll()) return;
      if (submitting) return;

      const payload: CreateCandidateRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        educations: educations
          .filter((ed) => ed.institution.trim() || ed.title.trim() || ed.startDate)
          .map((ed) => ({
            institution: ed.institution.trim(),
            title: ed.title.trim(),
            startDate: ed.startDate,
            endDate: ed.endDate || null,
          })),
        workExperiences: workExperiences
          .filter((ex) => ex.company.trim() || ex.position.trim() || ex.startDate)
          .map((ex) => ({
            company: ex.company.trim(),
            position: ex.position.trim(),
            description: ex.description?.trim() || null,
            startDate: ex.startDate,
            endDate: ex.endDate || null,
          })),
        cv: cv ?? null,
      };

      setSubmitting(true);
      try {
        await createCandidate(payload);
        setSuccess(true);
        onSuccess?.();
      } catch (err) {
        setApiError(getCandidateApiError(err));
      } finally {
        setSubmitting(false);
      }
    },
    [
      firstName,
      lastName,
      email,
      phone,
      address,
      educations,
      workExperiences,
      cv,
      validateAll,
      submitting,
      onSuccess,
    ]
  );

  const addEducation = () => {
    if (educations.length >= MAX_EDUCATIONS) return;
    setEducations((prev) => [...prev, initialEducation()]);
  };
  const removeEducation = (index: number) => {
    if (educations.length <= 1) return;
    setEducations((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`education-${index}`];
      return next;
    });
  };
  const addExperience = () => {
    setWorkExperiences((prev) => [...prev, initialExperience()]);
  };
  const removeExperience = (index: number) => {
    if (workExperiences.length <= 1) return;
    setWorkExperiences((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`experience-${index}`];
      return next;
    });
  };

  const isInvalid = useCallback((): boolean => {
    if (v.validateFirstName(firstName)) return true;
    if (v.validateLastName(lastName)) return true;
    if (v.validateEmail(email)) return true;
    if (v.validatePhone(phone)) return true;
    if (v.validateAddress(address)) return true;
    if (educations.length > MAX_EDUCATIONS) return true;
    for (let i = 0; i < educations.length; i++) {
      const ed = educations[i];
      const inst = (ed.institution ?? '').trim();
      const title = (ed.title ?? '').trim();
      const start = (ed.startDate ?? '').trim();
      const educationFilled = inst !== '' || title !== '' || start !== '';
      if (!educationFilled) continue;
      if (
        v.validateEducationInstitution(ed.institution ?? '') ||
        v.validateEducationTitle(ed.title ?? '') ||
        v.validateEducationStartDate(ed.startDate ?? '')
      )
        return true;
    }
    for (let i = 0; i < workExperiences.length; i++) {
      const ex = workExperiences[i];
      const company = (ex.company ?? '').trim();
      const position = (ex.position ?? '').trim();
      const start = (ex.startDate ?? '').trim();
      const experienceFilled = company !== '' || position !== '' || start !== '';
      if (!experienceFilled) continue;
      if (
        v.validateWorkCompany(ex.company ?? '') ||
        v.validateWorkPosition(ex.position ?? '') ||
        v.validateWorkDescription(ex.description ?? '') ||
        v.validateWorkStartDate(ex.startDate ?? '')
      )
        return true;
    }
    return false;
  }, [firstName, lastName, email, phone, address, educations, workExperiences]);

  if (success) {
    return (
      <Container>
        <Alert variant="success">Candidate created successfully.</Alert>
        {onSuccess && (
          <Button variant="primary" onClick={onSuccess}>
            Continue
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit} noValidate>
        {apiError && (
          <Alert variant="danger" dismissible onClose={() => setApiError(null)}>
            {apiError.message}
            {Array.isArray(apiError.details) && (
              <ul className="mb-0 mt-1">
                {(apiError.details as { field?: string; message?: string }[]).map((d, i) => (
                  <li key={i}>{d.message ?? d.field}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <fieldset>
          <legend>Profile</legend>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label htmlFor="firstName">First name</Form.Label>
                <Form.Control
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setErrors((p) => ({ ...p, firstName: v.validateFirstName(firstName) ?? '' }))}
                  isInvalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
                <Form.Control.Feedback type="invalid" id="firstName-error">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label htmlFor="lastName">Last name</Form.Label>
                <Form.Control
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setErrors((p) => ({ ...p, lastName: v.validateLastName(lastName) ?? '' }))}
                  isInvalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
                <Form.Control.Feedback type="invalid" id="lastName-error">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-2">
            <Form.Label htmlFor="email">Email</Form.Label>
            <Form.Control
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setErrors((p) => ({ ...p, email: v.validateEmail(email) ?? '' }))}
              isInvalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            <Form.Control.Feedback type="invalid" id="email-error">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label htmlFor="phone">Phone (optional)</Form.Label>
            <Form.Control
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setErrors((p) => ({ ...p, phone: v.validatePhone(phone) ?? '' }))}
              isInvalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            <Form.Control.Feedback type="invalid" id="phone-error">
              {errors.phone}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label htmlFor="address">Address (optional)</Form.Label>
            <Form.Control
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setErrors((p) => ({ ...p, address: v.validateAddress(address) ?? '' }))}
              isInvalid={!!errors.address}
              maxLength={101}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            <Form.Control.Feedback type="invalid" id="address-error">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>
        </fieldset>

        <fieldset className="mt-4">
          <legend>Education (max 3)</legend>
          {educations.map((edu, i) => (
            <div key={i} className="mb-4">
              <EducationFields
                value={edu}
                onChange={(next) =>
                  setEducations((prev) => prev.map((e, j) => (j === i ? next : e)))
                }
                onRemove={() => removeEducation(i)}
                showRemove={educations.length > 1}
                index={i}
                error={errors[`education-${i}`]}
                describedById={`education-${i}-error`}
              />
              {errors[`education-${i}`] && (
                <Form.Text id={`education-${i}-error`} className="text-danger">
                  {errors[`education-${i}`]}
                </Form.Text>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={addEducation}
            disabled={educations.length >= MAX_EDUCATIONS}
            aria-label="Add another education"
          >
            Add education
          </Button>
          {errors.educations && (
            <Form.Text className="text-danger d-block">{errors.educations}</Form.Text>
          )}
        </fieldset>

        <fieldset className="mt-4">
          <legend>Work experience</legend>
          {workExperiences.map((exp, i) => (
            <div key={i} className="mb-4">
              <ExperienceFields
                value={exp}
                onChange={(next) =>
                  setWorkExperiences((prev) => prev.map((e, j) => (j === i ? next : e)))
                }
                onRemove={() => removeExperience(i)}
                showRemove={workExperiences.length > 1}
                index={i}
                error={errors[`experience-${i}`]}
                describedById={`experience-${i}-error`}
              />
              {errors[`experience-${i}`] && (
                <Form.Text id={`experience-${i}-error`} className="text-danger">
                  {errors[`experience-${i}`]}
                </Form.Text>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={addExperience}
            aria-label="Add another work experience"
          >
            Add experience
          </Button>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="visually-hidden">CV upload</legend>
          <FileInput
            value={selectedFile}
            onChange={handleFileChange}
            error={fileError}
            describedById="cv-file-error"
          />
          {uploading && <Form.Text className="text-muted">Uploading…</Form.Text>}
        </fieldset>

        <div className="mt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || uploading || isInvalid()}
          >
            {submitting ? 'Creating…' : 'Create candidate'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
