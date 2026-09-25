import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, LogOut, RefreshCw } from 'lucide-react';
import { ApiError, bookAppointment, getAvailability, getLocations, getSpecialties, type FreeSlot, type Location, type Specialty } from '../lib/api';

interface Props { accessToken: string; onLogout: () => void; }

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function AuthenticatedBookingScreen({ accessToken, onLogout }: Props) {
  const [date, setDate] = useState(tomorrow);
  const [locationId, setLocationId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getLocations(), getSpecialties()]).then(([loadedLocations, loadedSpecialties]) => {
      setLocations(loadedLocations);
      setSpecialties(loadedSpecialties);
    }).catch(() => setError('No fue posible cargar los catálogos.'));
  }, []);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function search(event?: FormEvent) {
    event?.preventDefault();
    setError(null);
    setMessage(null);
    setSelectedSlot(null);
    setLoading(true);
    try {
      setSlots(await getAvailability({ date, locationId: locationId ? Number(locationId) : undefined, specialtyId: specialtyId ? Number(specialtyId) : undefined }, accessToken));
    } catch {
      setError('No fue posible consultar la disponibilidad.');
    } finally { setLoading(false); }
  }

  async function book() {
    if (!selectedSlot || !specialtyId) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const result = await bookAppointment({ professionalId: selectedSlot.professionalId, locationId: selectedSlot.locationId, specialtyId: Number(specialtyId), startAt: selectedSlot.startAt, reason: reason || undefined }, accessToken);
      setMessage(`Solicitud creada correctamente. Estado: ${result.status}.`);
      setSelectedSlot(null);
      await search();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409 && cause.code === 'SLOT_NOT_AVAILABLE') {
        setError('Ese slot acaba de ser reservado por otra persona. Actualiza la disponibilidad y elige otro.');
        await search();
      } else setError('No fue posible reservar el slot.');
    } finally { setLoading(false); }
  }

  return <main className="w-full max-w-5xl rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-10">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
      <div><div className="flex items-center gap-2 text-blue-600"><CalendarDays className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-wider">Agenda</span></div><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Encuentra tu cita</h1><p className="mt-1 text-sm text-slate-500">La disponibilidad se consulta directamente al API.</p></div>
      <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600" type="button"><LogOut className="h-4 w-4" /> Cerrar sesión</button>
    </header>
    <form onSubmit={search} className="mt-7 grid gap-4 md:grid-cols-4">
      <label className="text-sm text-slate-600">Fecha<input required min={minDate} value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2.5" type="date" /></label>
      <label className="text-sm text-slate-600">Sede<select value={locationId} onChange={(event) => setLocationId(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2.5"><option value="">Todas</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
      <label className="text-sm text-slate-600">Especialidad<select required value={specialtyId} onChange={(event) => setSpecialtyId(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2.5"><option value="">Selecciona</option>{specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name} ({specialty.appointmentDurationMinutes} min)</option>)}</select></label>
      <button disabled={loading} className="self-end rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60" type="submit">{loading ? 'Consultando…' : 'Consultar slots'}</button>
    </form>
    {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
    {message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}
    <section className="mt-8"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Slots disponibles</h2><button onClick={() => search()} className="inline-flex items-center gap-1 text-sm text-blue-600" type="button"><RefreshCw className="h-4 w-4" /> Actualizar</button></div>{slots.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Consulta una fecha para ver horarios.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{slots.map((slot) => <button key={slot.slotId} onClick={() => setSelectedSlot(slot)} className={`rounded-xl border p-4 text-left text-sm transition ${selectedSlot?.slotId === slot.slotId ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`} type="button"><span className="font-semibold text-slate-900">{new Date(slot.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span><span className="mt-1 block text-xs text-slate-500">Profesional #{slot.professionalId}</span></button>)}</div>}</section>
    {selectedSlot && <section className="mt-8 rounded-2xl bg-slate-50 p-5"><h2 className="font-semibold text-slate-900">Confirmar solicitud</h2><p className="mt-1 text-sm text-slate-500">{selectedSlot.startAt.replace('T', ' ')} · sede #{selectedSlot.locationId}</p><textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Motivo (opcional)" rows={3} /><button disabled={loading} onClick={book} className="mt-3 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60" type="button">Confirmar reserva</button></section>}
  </main>;
}
