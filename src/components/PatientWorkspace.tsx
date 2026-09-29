import { CalendarPlus, ClipboardList, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { AuthenticatedBookingScreen, type PatientSection } from './AuthenticatedBookingScreen';

interface Props { accessToken: string; onLogout: () => void; }

export function PatientWorkspace({ accessToken, onLogout }: Props) {
  const [section, setSection] = useState<PatientSection>('booking');

  const items: Array<{ id: PatientSection; label: string; icon: typeof CalendarPlus }> = [
    { id: 'booking', label: 'Reservar cita', icon: CalendarPlus },
    { id: 'appointments', label: 'Mis citas', icon: ClipboardList },
    { id: 'profile', label: 'Mi perfil', icon: UserRound },
  ];

  return <div className="flex w-full max-w-7xl flex-col gap-4 lg:flex-row lg:items-start">
    <aside className="rounded-3xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/50 lg:sticky lg:top-6 lg:w-64">
      <div className="px-3 py-2"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Campusland</p><p className="mt-1 text-lg font-bold text-slate-900">Portal de citas</p></div>
      <nav className="mt-5 space-y-1" aria-label="Servicios del paciente">
        {items.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${section === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><Icon className="h-4 w-4" />{label}</button>)}
      </nav>
      <button onClick={onLogout} className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600" type="button"><LogOut className="h-4 w-4" />Cerrar sesión</button>
    </aside>
    <div className="min-w-0 flex-1"><AuthenticatedBookingScreen accessToken={accessToken} onLogout={onLogout} section={section} /></div>
  </div>;
}
