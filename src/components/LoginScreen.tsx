import { FormEvent, useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { loginUser } from '../lib/api';

interface LoginScreenProps {
  onNavigateRegister: () => void;
  onLoginSuccess: (accessToken: string) => void;
}

export function LoginScreen({ onNavigateRegister, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginUser({ email, password, deviceInfo: 'citas-web' });
      onLoginSuccess(result.accessToken);
    } catch (cause) {
      setError(cause instanceof Error && cause.message === 'BAD_CREDENTIALS'
        ? 'Correo o contraseña incorrectos.'
        : 'No fue posible iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="my-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
      <div className="grid min-h-[640px] grid-cols-1 lg:grid-cols-12">
        <section className="flex flex-col p-4 md:p-5 lg:col-span-6">
          <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/40 bg-gradient-to-b from-[#07152B] via-[#0A1F3E] to-[#0E2952] p-8 text-white sm:p-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" /> Portal de pacientes</div>
              <h1 className="text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">Gestiona tus citas con claridad y confianza</h1>
              <p className="max-w-md text-sm font-light leading-relaxed text-slate-300 sm:text-base">Tu información se gestiona de forma centralizada y segura.</p>
            </div>
            <div className="mt-12 rounded-2xl border border-blue-400/20 bg-white/5 p-5 text-sm leading-6 text-slate-300">Inicia sesión para consultar la disponibilidad y continuar con tu solicitud.</div>
          </div>
        </section>
        <section className="flex flex-col justify-between bg-white px-8 py-10 sm:px-12 sm:py-12 md:px-14 lg:col-span-6">
          <div>
            <div className="mb-8 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-blue-500/20">+</div><div><span className="block text-base font-bold tracking-tight text-slate-900">Portal de Citas</span><span className="text-xs font-medium uppercase tracking-wide text-slate-400">Acceso seguro</span></div></div>
            <div className="mb-8"><h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Iniciar sesión</h2><p className="mt-1.5 text-sm text-slate-500">Accede para consultar y gestionar tus citas.</p></div>
            <form className="space-y-5" onSubmit={submit}>
              <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="email">Correo electrónico</label><div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input required value={email} onChange={(event) => setEmail(event.target.value)} className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm" id="email" placeholder="usuario@ejemplo.com" type="email" /></div></div>
              <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="password">Contraseña</label><div className="relative"><Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input required value={password} onChange={(event) => setPassword(event.target.value)} className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm" id="password" placeholder="Introduce tu contraseña" type="password" /></div></div>
              {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
              <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60" type="submit">{loading ? 'Validando…' : 'Iniciar sesión'}</button>
            </form>
          </div>
          <div className="mt-8 space-y-3 border-t border-slate-100 pt-6 text-center"><p className="text-sm text-slate-600">¿No tienes una cuenta? <button className="font-semibold text-blue-600 hover:text-blue-700" onClick={onNavigateRegister} type="button">Regístrate aquí</button></p><div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck className="h-4 w-4" /> Tus datos se tratan de acuerdo con las políticas aprobadas del portal.</div></div>
        </section>
      </div>
    </main>
  );
}
