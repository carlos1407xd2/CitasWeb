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
export interface Profile { id: number; firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string | null; }

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
  if (response.status === 204) return undefined as T;
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
export const getProfile = (accessToken: string) => request<Profile>('/api/v1/profile', undefined, accessToken);
export const updateProfile = (payload: Pick<Profile, 'firstName' | 'lastName' | 'phone'>, accessToken: string) => request<Profile>('/api/v1/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, accessToken);
export const requestPasswordReset = (email: string) => request<{ developmentToken: string | null }>('/api/v1/auth/password/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
export const confirmPasswordReset = (token: string, password: string) => request<void>('/api/v1/auth/password/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
export interface ProfessionalBlock { id:number; professionalId:number; locationId:number; date:string; startTime:string; endTime:string; active:boolean; }
export interface ProfessionalAgendaItem { id:number; patientId:number; patientName:string; specialty:string; location:string; startAt:string; endAt:string; status:string; }
export interface AdminInboxItem { id:number; type:string; status:string; specialty:string; location:string; startAt:string; }
export const getProfessionalBlocks = (token:string) => request<{blocks:ProfessionalBlock[]}>('/api/v1/professional/availability-blocks', undefined, token);
export const createProfessionalBlock = (payload: {locationId:number;date:string;startTime:string;endTime:string}, token:string) => request<ProfessionalBlock>('/api/v1/professional/availability-blocks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export const getProfessionalAgenda = (token:string) => request<ProfessionalAgendaItem[]>('/api/v1/professional/appointments',undefined,token);
export const closeProfessionalAppointment = (id:number,outcome:string,token:string) => request<void>(`/api/v1/professional/appointments/${id}/closure`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({outcome})},token);
export const getAdminInbox = (token:string, filters?:{from?:string;to?:string;locationId?:number;professionalId?:number;specialtyId?:number}) => { const q=new URLSearchParams(); Object.entries(filters??{}).forEach(([k,v])=>v!==undefined&&q.set(k,String(v))); return request<{items:AdminInboxItem[]}>(`/api/v1/admin/inbox${q.toString()?`?${q}`:''}`,undefined,token); };
export const decideAdminAppointment = (id:number,approve:boolean,reason:string|undefined,token:string) => request<void>(`/api/v1/admin/appointments/${id}/${approve?'approve':'reject'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(approve?{}:{reason})},token);
export const decideAdminReschedule = (id:number,approve:boolean,reason:string|undefined,token:string) => request<void>(`/api/v1/admin/reschedule-requests/${id}/${approve?'approve':'reject'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(approve?{}:{reason})},token);
export interface AdminSpecialty { id:number; code:string; name:string; duration:number; general:boolean; requiresAdminApproval:boolean; active:boolean; }
export interface AdminEps { id:number; code:string; name:string; active:boolean; }
export interface AdminPlan { id:number; epsId:number; regimeId:number; code:string; name:string; active:boolean; }
export const getAdminSpecialties = (token:string) => request<AdminSpecialty[]>('/api/v1/admin/catalogs/specialties',undefined,token);
export const createAdminSpecialty = (payload:{code:string;name:string;duration:number;general:boolean;requiresAdminApproval:boolean},token:string) => request<AdminSpecialty>('/api/v1/admin/catalogs/specialties',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export const updateAdminSpecialty = (id:number,payload:{code:string;name:string;duration:number;general:boolean;requiresAdminApproval:boolean},token:string) => request<AdminSpecialty>(`/api/v1/admin/catalogs/specialties/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export const getAdminEps = (token:string) => request<AdminEps[]>('/api/v1/admin/catalogs/eps',undefined,token);
export const createAdminEps = (payload:{code:string;name:string},token:string) => request<AdminEps>('/api/v1/admin/catalogs/eps',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export const updateAdminEps = (id:number,payload:{code:string;name:string},token:string) => request<AdminEps>(`/api/v1/admin/catalogs/eps/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export const getAdminPlans = (epsId:number,token:string) => request<AdminPlan[]>(`/api/v1/admin/catalogs/eps/${epsId}/plans`,undefined,token);
export const createAdminPlan = (payload:{epsId:number;regimeId:number;code:string;name:string},token:string) => request<AdminPlan>('/api/v1/admin/catalogs/plans',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export const updateAdminPlan = (id:number,payload:{epsId:number;regimeId:number;code:string;name:string},token:string) => request<AdminPlan>(`/api/v1/admin/catalogs/plans/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export interface AdminProfessional { id:number; firstName:string; lastName:string; email:string; professionalCode:string; licenseNumber:string; active:boolean; }
export const getAdminProfessionals = (token:string) => request<AdminProfessional[]>('/api/v1/admin/professionals',undefined,token);
export const createAdminProfessional = (payload:Record<string,unknown>,token:string) => request<AdminProfessional>('/api/v1/admin/professionals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
export const assignProfessionalSpecialties = (id:number,assignments:{specialtyId:number;primary:boolean}[],token:string) => request<void>(`/api/v1/admin/professionals/${id}/specialties`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({assignments})},token);
export const assignProfessionalLocations = (id:number,locationIds:number[],token:string) => request<void>(`/api/v1/admin/professionals/${id}/locations`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({locationIds})},token);

export const requestReschedule = (appointmentId: number, payload: { locationId: number; startAt: string }, accessToken: string) => request<{ requestId: number; status: string }>(`/api/v1/appointments/${appointmentId}/reschedule-requests`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
}, accessToken);
