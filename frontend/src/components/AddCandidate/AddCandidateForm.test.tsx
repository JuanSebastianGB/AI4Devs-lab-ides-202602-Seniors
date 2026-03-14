import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddCandidateForm } from './AddCandidateForm';
import * as candidateService from '../../services/candidateService';
import * as uploadService from '../../services/uploadService';

jest.mock('../../services/candidateService', () => ({
  ...jest.requireActual('../../services/candidateService'),
  createCandidate: jest.fn(),
}));
jest.mock('../../services/uploadService', () => ({
  ...jest.requireActual('../../services/uploadService'),
  uploadFile: jest.fn(),
}));

const mockCreateCandidate = jest.mocked(candidateService.createCandidate);
const mockUploadFile = jest.mocked(uploadService.uploadFile);

describe('AddCandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validation', () => {
    it('shows validation error for invalid email and disables submit', async () => {
      render(<AddCandidateForm />);
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'not-an-email');
      emailInput.blur();
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
      const submit = screen.getByRole('button', { name: /create candidate/i });
      expect(submit).toBeDisabled();
    });

    it('shows validation error for short first name and disables submit', async () => {
      render(<AddCandidateForm />);
      const firstName = screen.getByLabelText(/first name/i);
      await userEvent.type(firstName, 'A');
      firstName.blur();
      await waitFor(() => {
        expect(screen.getByText(/2–100 characters/i)).toBeInTheDocument();
      });
      const submit = screen.getByRole('button', { name: /create candidate/i });
      expect(submit).toBeDisabled();
    });

    it('shows validation error for first name with numbers and disables submit', async () => {
      render(<AddCandidateForm />);
      const firstName = screen.getByLabelText(/first name/i);
      await userEvent.type(firstName, 'John1');
      firstName.blur();
      await waitFor(() => {
        expect(screen.getByText(/only letters/i)).toBeInTheDocument();
      });
      const submit = screen.getByRole('button', { name: /create candidate/i });
      expect(submit).toBeDisabled();
    });

    it('shows validation error for invalid phone format', async () => {
      render(<AddCandidateForm />);
      const phone = screen.getByLabelText(/phone/i);
      await userEvent.type(phone, '123456789');
      phone.blur();
      await waitFor(() => {
        expect(screen.getByText(/6, 7, or 9/i)).toBeInTheDocument();
      });
    });

    it('allows at most 3 education entries and disables add button at 3', async () => {
      render(<AddCandidateForm />);
      const addEdu = screen.getByRole('button', { name: /add.*education/i });
      expect(addEdu).not.toBeDisabled();
      await userEvent.click(addEdu);
      await userEvent.click(addEdu);
      expect(screen.getAllByText(/institution/i).length).toBe(3);
      expect(addEdu).toBeDisabled();
    });
  });

  describe('submit', () => {
    it('calls createCandidate with correct payload when form is valid', async () => {
      mockCreateCandidate.mockResolvedValue({
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      });
      render(<AddCandidateForm />);

      await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
      await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
      const institution = screen.getByLabelText(/institution/i);
      await userEvent.type(institution, 'University');
      await userEvent.type(screen.getByLabelText(/title/i), 'Degree');
      const startDate = screen.getAllByLabelText(/start date/i)[0];
      await userEvent.type(startDate, '2020-01-01');
      const company = screen.getByLabelText(/company/i);
      await userEvent.type(company, 'Acme');
      await userEvent.type(screen.getByLabelText(/position/i), 'Engineer');
      const expStart = screen.getAllByLabelText(/start date/i)[1];
      await userEvent.type(expStart, '2021-06-01');

      const submit = screen.getByRole('button', { name: /create candidate/i });
      await userEvent.click(submit);

      await waitFor(() => {
        expect(mockCreateCandidate).toHaveBeenCalledTimes(1);
      });
      const call = mockCreateCandidate.mock.calls[0][0];
      expect(call.firstName).toBe('Jane');
      expect(call.lastName).toBe('Doe');
      expect(call.email).toBe('jane@example.com');
      expect(call.educations).toHaveLength(1);
      expect(call.educations![0].institution).toBe('University');
      expect(call.workExperiences).toHaveLength(1);
      expect(call.workExperiences![0].company).toBe('Acme');
      expect(call.cv).toBeNull();
    });

    it('includes cv in payload when upload succeeded', async () => {
      mockCreateCandidate.mockResolvedValue({
        id: 1,
        firstName: 'Jo',
        lastName: 'Do',
        email: 'j@e.com',
      });
      mockUploadFile.mockResolvedValue({ filePath: '/uploads/x.pdf', fileType: 'application/pdf' });
      render(<AddCandidateForm />);

      await userEvent.type(screen.getByLabelText(/first name/i), 'Jo');
      await userEvent.type(screen.getByLabelText(/last name/i), 'Do');
      await userEvent.type(screen.getByLabelText(/email/i), 'j@e.com');
      await userEvent.type(screen.getByLabelText(/institution/i), 'Un');
      await userEvent.type(screen.getByLabelText(/title/i), 'Ti');
      await userEvent.type(screen.getAllByLabelText(/start date/i)[0], '2020-01-01');
      await userEvent.type(screen.getByLabelText(/company/i), 'Co');
      await userEvent.type(screen.getByLabelText(/position/i), 'Po');
      await userEvent.type(screen.getAllByLabelText(/start date/i)[1], '2021-01-01');

      const fileInput = screen.getByLabelText(/choose cv file/i);
      const file = new File(['pdf content'], 'cv.pdf', { type: 'application/pdf' });
      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(file);
      });
      await waitFor(() => {
        expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
      });

      const submit = screen.getByRole('button', { name: /create candidate/i });
      await userEvent.click(submit);

      await waitFor(() => {
        expect(mockCreateCandidate).toHaveBeenCalledTimes(1);
      });
      const call = mockCreateCandidate.mock.calls[0][0];
      expect(call.cv).toEqual({ filePath: '/uploads/x.pdf', fileType: 'application/pdf' });
    });

    it('displays API error when createCandidate fails', async () => {
      mockCreateCandidate.mockRejectedValue(new Error('Email already exists'));
      render(<AddCandidateForm />);

      await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
      await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await userEvent.type(screen.getByLabelText(/institution/i), 'Un');
      await userEvent.type(screen.getByLabelText(/title/i), 'Ti');
      await userEvent.type(screen.getAllByLabelText(/start date/i)[0], '2020-01-01');
      await userEvent.type(screen.getByLabelText(/company/i), 'Co');
      await userEvent.type(screen.getByLabelText(/position/i), 'Po');
      await userEvent.type(screen.getAllByLabelText(/start date/i)[1], '2021-01-01');

      const submit = screen.getByRole('button', { name: /create candidate/i });
      await userEvent.click(submit);

      await waitFor(() => {
        expect(mockCreateCandidate).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });
});
