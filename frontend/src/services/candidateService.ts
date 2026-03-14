import axios, { AxiosError } from 'axios';
import {
  CreateCandidateRequest,
  CreateCandidateResponse,
} from '../types/candidate';

const baseURL = process.env.REACT_APP_API_URL ?? '';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export async function createCandidate(
  data: CreateCandidateRequest
): Promise<CreateCandidateResponse> {
  const response = await axios.post<CreateCandidateResponse>(
    `${baseURL}/candidates`,
    data,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export function isCandidateApiError(
  error: unknown
): error is AxiosError<{ message?: string; code?: string; details?: unknown }> {
  return axios.isAxiosError(error);
}

export function getCandidateApiError(error: unknown): ApiError {
  if (isCandidateApiError(error)) {
    const data = error.response?.data;
    return {
      message: typeof data?.message === 'string' ? data.message : error.message,
      status: error.response?.status,
      code: typeof data?.code === 'string' ? data.code : undefined,
      details: data?.details,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Request failed',
  };
}
