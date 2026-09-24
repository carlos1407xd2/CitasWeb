import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, FileText, Lock, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { ApiError, getActiveInsurancePlans, registerUser, type InsurancePlan, type RegistrationResult } from '../lib/api';

interface RegisterScreenProps {
  onRegisterSuccess: (result: RegistrationResult) => void;
  onNavigateLogin: () => void;
}

const inputClass = 'block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

export function RegisterScreen({ onRegisterSuccess, onNavigateLogin }: RegisterScreenProps) {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [insurancePlanId, setInsurancePlanId] = useState('');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getActiveInsurancePlans()
      .then(setPlans)
      .catch(() => setError('No fue posible cargar los planes de salud. Inténtalo nuevamente.'))
      .finally(() => setLoadingPlans(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await registerUser({
        firstName: firstName.trim(), lastName: lastName.trim(), documentType,
        documentNumber: documentNumber.trim(), email: email.trim(), phone: phone.trim() || undefined,
        password, insurancePlanId: insurancePlanId ? Number(insurancePlanId) : undefined,
      });
      onRegisterSuccess(result);
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'INVALID_INSURANCE_PLAN') setError('El plan seleccionado ya no está disponible. Elige otro o continúa sin plan.');
      else if (cause instanceof ApiError && cause.code === 'DUPLICATE_USER') setError('El correo o documento ya está registrado.');
      else setError('No fue posible completar el registro. Verifica tus datos e inténtalo de nuevo.');
    } finally { setSubmitting(false); }
  }

  return (
    <main className="my-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
      <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-12">
        <section className="flex flex-col p-4 md:p-5 lg:col-span-5">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800/40 bg-gradient-to-b from-[#07152B] via-[#0A1F3E] to-[#0E2952] p-8 text-white sm:p-10">
            <div className="space-y-4"><div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Registro de paciente</div><h1 className="text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">Tu salud, organizada desde el primer paso</h1><p className="text-sm font-light leading-relaxed text-slate-300 sm:text-base">Crea tu cuenta y, si lo deseas, selecciona un plan de salud disponible.</p></div>
            <div className="mt-12 space-y-3 rounded-2xl border border-blue-400/20 bg-white/5 p-5 text-xs leading-5 text-slate-300"><p>✓ Registro sin plan de salud</p><p>✓ Selección opcional desde el catálogo vigente</p><p>✓ Datos tratados bajo las políticas del portal</p></div>
          </div>
        </section>
        <section className="bg-white px-8 py-8 sm:px-12 sm:py-10 lg:col-span-7">
          <div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 font-bold text-white">+</div><div><span className="block text-sm font-bold tracking-tight text-slate-900">Portal de Citas</span><span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Nuevo paciente</span></div></div><button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600" onClick={onNavigateLogin} type="button"><ArrowLeft className="h-3.5 w-3.5" />Volver</button></div>
          <div className="mb-6"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Crear cuenta</h2><p className="mt-1 text-xs text-slate-500 sm:text-sm">Los campos marcados con * son obligatorios.</p></div>
          <form className="space-y-4" id="register-form" onSubmit={handleSubmit}>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700" role="alert">{error}</div>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field icon={<UserRound />} id="first-name" label="Nombres *" value={firstName} onChange={setFirstName} placeholder="Ej. Carmen" /><Field icon={<UserRound />} id="last-name" label="Apellidos *" value={lastName} onChange={setLastName} placeholder="Ej. Rodríguez" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-700" htmlFor="document-type">Tipo de documento *</label><select className={`${inputClass} px-3`} id="document-type" onChange={(e) => setDocumentType(e.target.value)} value={documentType}><option value="CC">Cédula de ciudadanía</option><option value="CE">Cédula de extranjería</option><option value="TI">Tarjeta de identidad</option><option value="PP">Pasaporte</option></select></div><Field icon={<FileText />} id="document-number" label="Número de documento *" value={documentNumber} onChange={setDocumentNumber} placeholder="Número sin separadores" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field icon={<Mail />} id="email" label="Correo electrónico *" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" type="email" /><Field icon={<Phone />} id="phone" label="Teléfono" value={phone} onChange={setPhone} placeholder="300 000 0000" type="tel" required={false} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-700" htmlFor="insurance-plan">Plan de salud (opcional)</label><select className={`${inputClass} px-3`} disabled={loadingPlans} id="insurance-plan" onChange={(e) => setInsurancePlanId(e.target.value)} value={insurancePlanId}><option value="">{loadingPlans ? 'Cargando planes…' : 'Sin plan de salud'}</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></div><Field icon={<Lock />} id="password" label="Contraseña *" value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" type="password" /></div>
            <button className="mt-2 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-75" disabled={submitting} type="submit">{submitting ? 'Creando cuenta…' : 'Registrarme'}</button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-5 text-[11px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> No se solicitan números de póliza durante el registro.</div>
        </section>
      </div>
    </main>
  );
}

function Field({ icon, id, label, value, onChange, placeholder, type = 'text', required = true }: { icon: ReactNode; id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean }) {
  return <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-700" htmlFor={id}>{label}</label><div className="relative"><span className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400">{icon}</span><input className={`${inputClass} pl-10 pr-3`} id={id} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} type={type} value={value} /></div></div>;
}
