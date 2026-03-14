import axios, { AxiosError } from 'axios';
import { CreateResumeRequest } from '../types/candidate';

const baseURL = process.env.REACT_APP_API_URL ?? '';

export interface UploadError {
  message: string;
  status?: number;
}

export async function uploadFile(file: File): Promise<CreateResumeRequest> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<CreateResumeRequest>(`${baseURL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

export function isUploadError(error: unknown): error is AxiosError<{ message?: string; details?: unknown }> {
  return axios.isAxiosError(error);
}

export function getUploadErrorMessage(error: unknown): string {
  if (isUploadError(error)) {
    const data = error.response?.data;
    const msg = typeof data?.message === 'string' ? data.message : error.message;
    return msg || `Upload failed (${error.response?.status ?? 'network error'})`;
  }
  return error instanceof Error ? error.message : 'Upload failed';
}
