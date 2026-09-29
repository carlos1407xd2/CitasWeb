// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatedBookingScreen } from './AuthenticatedBookingScreen';

vi.mock('../lib/api', () => ({
  getProfile: vi.fn().mockResolvedValue({ id: 4, firstName: 'Usuario', lastName: 'Sintético', documentType: 'CC', documentNumber: '1000', email: 'synthetic@example.test', phone: '3000000000' }),
  updateProfile: vi.fn(), getLocations: vi.fn().mockResolvedValue([{ id: 1, name: 'HIC' }]), getSpecialties: vi.fn().mockResolvedValue([{ id: 2, name: 'Cardio', appointmentDurationMinutes: 60, general: false, requiresAdminApproval: true }]),
  getMyAppointments: vi.fn().mockResolvedValue([{ id: 8, professionalId: 5, professionalName: 'Profesional Sintético', locationId: 1, locationName: 'HIC', specialtyId: 2, specialtyName: 'Cardio', startAt: '2027-01-15T08:00:00', endAt: '2027-01-15T09:00:00', status: 'APPROVED', reason: null }]),
  getAvailability: vi.fn().mockResolvedValue([]), getAppointmentHistory: vi.fn().mockResolvedValue([]), bookAppointment: vi.fn(), cancelAppointment: vi.fn(), requestReschedule: vi.fn(),
}));

describe('AuthenticatedBookingScreen', () => {
  afterEach(() => cleanup());

  it('loads profile, filters and the user appointment list', async () => {
    render(<AuthenticatedBookingScreen accessToken="synthetic-access" onLogout={vi.fn()} />);
    expect(await screen.findByText('Encuentra tu cita')).toBeTruthy();
    expect(screen.getByText('HIC')).toBeTruthy();
    expect(screen.getByText('Cardio')).toBeTruthy();
    expect(screen.getByText(/Profesional:.*Profesional Sintético/)).toBeTruthy();
  });
});
