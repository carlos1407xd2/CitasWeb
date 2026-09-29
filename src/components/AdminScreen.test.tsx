// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminScreen } from './AdminScreen';
import { getAdminInbox } from '../lib/api';

vi.mock('../lib/api', () => {
  const inbox = vi.fn().mockResolvedValue({ items: [{ id: 7, type: 'APPOINTMENT', status: 'REQUESTED', specialty: 'Cardio', location: 'HIC', startAt: '2027-01-15T08:00:00' }] });
  return {
    getAdminInbox: inbox, getAdminSpecialties: vi.fn().mockResolvedValue([]), getAdminEps: vi.fn().mockResolvedValue([]), getAdminProfessionals: vi.fn().mockResolvedValue([]), getAdminPlans: vi.fn().mockResolvedValue([]),
    createAdminSpecialty: vi.fn(), createAdminEps: vi.fn(), createAdminPlan: vi.fn(), createAdminProfessional: vi.fn(), decideAdminAppointment: vi.fn().mockResolvedValue(undefined), decideAdminReschedule: vi.fn(), assignProfessionalLocations: vi.fn(), assignProfessionalSpecialties: vi.fn(),
  };
});

describe('AdminScreen', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('loads a pending request without rendering patient PII', async () => {
    render(<AdminScreen accessToken="synthetic-access" onLogout={vi.fn()} />);
    expect(await screen.findByText('APPOINTMENT · Cardio')).toBeTruthy();
    expect(screen.queryByText(/patient/i)).toBeNull();
  });

  it('sends visual inbox filters to the REST client', async () => {
    render(<AdminScreen accessToken="synthetic-access" onLogout={vi.fn()} />);
    await screen.findByText('APPOINTMENT · Cardio');
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2027-01-01' } });
    fireEvent.change(screen.getByPlaceholderText('ID sede'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    await waitFor(() => expect(getAdminInbox).toHaveBeenLastCalledWith('synthetic-access', expect.objectContaining({ from: '2027-01-01', locationId: 2 })));
  });
});
