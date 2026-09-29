// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfessionalScreen } from './ProfessionalScreen';

vi.mock('../lib/api', () => ({
  getProfessionalBlocks: vi.fn().mockResolvedValue({ blocks: [{ id: 1, professionalId: 4, locationId: 2, date: '2027-01-15', startTime: '08:00', endTime: '09:00', active: true }] }),
  getProfessionalAgenda: vi.fn().mockResolvedValue([{ id: 8, patientId: 12, patientName: 'Paciente Sintético', specialty: 'Cardio', location: 'HIC', startAt: '2027-01-15T08:00:00', endAt: '2027-01-15T09:00:00', status: 'APPROVED' }]),
  createProfessionalBlock: vi.fn(), closeProfessionalAppointment: vi.fn(),
}));

describe('ProfessionalScreen', () => {
  afterEach(() => cleanup());

  it('shows professional blocks and approved agenda', async () => {
    render(<ProfessionalScreen accessToken="synthetic-access" onLogout={vi.fn()} />);
    expect(await screen.findByText(/2027-01-15 · sede 2/)).toBeTruthy();
    expect(screen.getByText(/Paciente Sintético/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Completada' })).toBeTruthy();
  });
});
