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
export interface Location { id: number; code: string; name: string; address: string; city: string; department: string; }
export interface Specialty { id: number; code: string; name: string; appointmentDurationMinutes: number; general: boolean; requiresAdminApproval: boolean; }
export interface BookingPayload { professionalId: number; locationId: number; specialtyId: number; startAt: string; reason?: string; }
export interface BookingResult { appointmentId: number; status: string; }
export interface AppointmentSummary { id: number; professionalId: number; professionalName: string; locationId: number; locationName: string; specialtyId: number; specialtyName: string; startAt: string; endAt: string; status: string; reason: string | null; }
export interface StatusHistory { status: string; source: string; actorUserId: number | null; reason: string | null; changedAt: string; }

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
  }
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function request<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init?.headers },
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
}, accessToken?: string) => {
  const query = new URLSearchParams({ date: filters.date });
  if (filters.locationId !== undefined) query.set('locationId', String(filters.locationId));
  if (filters.specialtyId !== undefined) query.set('specialtyId', String(filters.specialtyId));
  if (filters.professionalId !== undefined) query.set('professionalId', String(filters.professionalId));
  return request<FreeSlot[]>(`/api/v1/availability?${query.toString()}`, undefined, accessToken);
};

export const getLocations = () => request<Location[]>('/api/v1/catalogs/locations');
export const getSpecialties = () => request<Specialty[]>('/api/v1/catalogs/specialties');

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

export const bookAppointment = (payload: BookingPayload, accessToken: string) =>
  request<BookingResult>('/api/v1/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, accessToken);

export const getMyAppointments = (accessToken: string) => request<AppointmentSummary[]>('/api/v1/appointments', undefined, accessToken);
export const getAppointmentHistory = (appointmentId: number, accessToken: string) => request<StatusHistory[]>(`/api/v1/appointments/${appointmentId}/history`, undefined, accessToken);
export const cancelAppointment = (appointmentId: number, accessToken: string, reason?: string) => request<void>(`/api/v1/appointments/${appointmentId}/cancel`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }),
}, accessToken);
