/**
 * Client-side validation rules mirroring backend (candidateSchemas).
 */

const LETTERS_ONLY = /^[a-zA-Z\s\-']+$/;
const SPANISH_PHONE = /^[679]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFirstName(value: string): string | undefined {
  if (!value.trim()) return 'First name is required';
  if (value.length < 2 || value.length > 100) return 'First name must be 2–100 characters';
  if (!LETTERS_ONLY.test(value)) return 'First name must contain only letters';
  return undefined;
}

export function validateLastName(value: string): string | undefined {
  if (!value.trim()) return 'Last name is required';
  if (value.length < 2 || value.length > 100) return 'Last name must be 2–100 characters';
  if (!LETTERS_ONLY.test(value)) return 'Last name must contain only letters';
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(value)) return 'Enter a valid email address';
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (!value.trim()) return undefined;
  if (!SPANISH_PHONE.test(value.replace(/\s/g, ''))) return 'Phone must be 9 digits starting with 6, 7, or 9';
  return undefined;
}

export function validateAddress(value: string): string | undefined {
  if (!value.trim()) return undefined;
  if (value.length > 100) return 'Address must be at most 100 characters';
  return undefined;
}

export function validateEducationInstitution(value: string): string | undefined {
  if (!value.trim()) return 'Institution is required';
  if (value.length > 100) return 'Institution must be at most 100 characters';
  return undefined;
}

export function validateEducationTitle(value: string): string | undefined {
  if (!value.trim()) return 'Title is required';
  if (value.length > 250) return 'Title must be at most 250 characters';
  return undefined;
}

export function validateEducationStartDate(value: string): string | undefined {
  if (!value.trim()) return 'Start date is required';
  return undefined;
}

export function validateWorkCompany(value: string): string | undefined {
  if (!value.trim()) return 'Company is required';
  if (value.length > 100) return 'Company must be at most 100 characters';
  return undefined;
}

export function validateWorkPosition(value: string): string | undefined {
  if (!value.trim()) return 'Position is required';
  if (value.length > 100) return 'Position must be at most 100 characters';
  return undefined;
}

export function validateWorkDescription(value: string): string | undefined {
  if (value.length > 200) return 'Description must be at most 200 characters';
  return undefined;
}

export function validateWorkStartDate(value: string): string | undefined {
  if (!value.trim()) return 'Start date is required';
  return undefined;
}
