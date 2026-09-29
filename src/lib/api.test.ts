import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, assignProfessionalLocations, assignProfessionalSpecialties, confirmPasswordReset, decideAdminAppointment, decideAdminReschedule, getActiveInsurancePlans, getAdminInbox, getAvailability, registerUser, requestPasswordReset } from './api';

afterEach(() => vi.restoreAllMocks());

describe('API client', () => {
  it('loads the active insurance-plan catalog', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, name: 'Plan activo' }]), { status: 200 }),
    );

    await expect(getActiveInsurancePlans()).resolves.toEqual([{ id: 1, name: 'Plan activo' }]);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/v1/catalogs/insurance-plans', expect.any(Object));
  });

  it('sends an optional plan only when it was selected', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 7, email: 'patient@example.test', insurancePlanId: 1 }), { status: 201 }),
    );

    await expect(registerUser({ firstName: 'Ana', lastName: 'Paz', documentType: 'CC', documentNumber: '1001', email: 'patient@example.test', password: 'Password123*', insurancePlanId: 1 })).resolves.toMatchObject({ insurancePlanId: 1 });
    expect(fetchMock.mock.calls[0][1]?.body).toContain('"insurancePlanId":1');
  });

  it('serializes availability filters without inventing client-side slots', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    await expect(getAvailability({ date: '2026-10-01', locationId: 1, specialtyId: 2 })).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/availability?date=2026-10-01&locationId=1&specialtyId=2',
      expect.any(Object),
    );
  });

  it('exposes typed backend errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 'INVALID_INSURANCE_PLAN' }), { status: 400 }),
    );

    await expect(getActiveInsurancePlans()).rejects.toBeInstanceOf(ApiError);
  });

  it('uses the password recovery contract without exposing tokens in the client', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ developmentToken: 'synthetic-token' }), { status: 200 })).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const response = await requestPasswordReset('patient@example.test');
    await confirmPasswordReset(response.developmentToken!, 'NewPassword123*');
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8080/api/v1/auth/password/request');
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:8080/api/v1/auth/password/confirm');
  });

  it('routes administrative decisions to the correct resource', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    await decideAdminAppointment(10, true, undefined, 'access');
    await decideAdminReschedule(20, false, 'No disponibilidad', 'access');
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8080/api/v1/admin/appointments/10/approve');
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:8080/api/v1/admin/reschedule-requests/20/reject');
  });

  it('loads the administrative inbox with authorization', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 }));
    await expect(getAdminInbox('access')).resolves.toEqual({ items: [] });
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer access' });
  });

  it('serializes administrative inbox filters and professional assignments', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    await getAdminInbox('access', { from: '2026-10-01', to: '2026-10-31', locationId: 1, professionalId: 2, specialtyId: 3 });
    await assignProfessionalSpecialties(9, [{ specialtyId: 3, primary: true }], 'access');
    await assignProfessionalLocations(9, [1, 2], 'access');
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/admin/inbox?from=2026-10-01&to=2026-10-31&locationId=1&professionalId=2&specialtyId=3');
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:8080/api/v1/admin/professionals/9/specialties');
    expect(fetchMock.mock.calls[2][0]).toBe('http://localhost:8080/api/v1/admin/professionals/9/locations');
  });
});
