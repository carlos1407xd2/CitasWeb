export interface InsurancePlan {
  id: number;
  name: string;
}

export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone?: string;
  password: string;
  insurancePlanId?: number;
}

export interface RegistrationResult {
  id: number;
  email: string;
  insurancePlanId: number | null;
}

export interface FreeSlot {
  slotId: number;
  professionalId: number;
  locationId: number;
  startAt: string;
  endAt: string;
}

export interface LoginPayload { email: string; password: string; deviceInfo?: string; }
export interface LoginResult { accessToken: string; refreshToken: string | null; tokenType: 'Bearer'; expiresInSeconds: number; }

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
  }
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ code: 'REQUEST_FAILED' }));
    throw new ApiError(response.status, body.code ?? 'REQUEST_FAILED');
  }
  return response.json() as Promise<T>;
}

export const getActiveInsurancePlans = () => request<InsurancePlan[]>('/api/v1/catalogs/insurance-plans');

export const getAvailability = (filters: {
  date: string;
  locationId?: number;
  specialtyId?: number;
  professionalId?: number;
}) => {
  const query = new URLSearchParams({ date: filters.date });
  if (filters.locationId !== undefined) query.set('locationId', String(filters.locationId));
  if (filters.specialtyId !== undefined) query.set('specialtyId', String(filters.specialtyId));
  if (filters.professionalId !== undefined) query.set('professionalId', String(filters.professionalId));
  return request<FreeSlot[]>(`/api/v1/availability?${query.toString()}`);
};

export const registerUser = (payload: RegistrationPayload) =>
  request<RegistrationResult>('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const loginUser = (payload: LoginPayload) =>
  request<LoginResult>('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
