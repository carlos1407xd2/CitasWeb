import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getActiveInsurancePlans, getAvailability, registerUser } from './api';

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
});
