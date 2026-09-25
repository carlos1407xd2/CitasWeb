import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AuthenticatedBookingScreen } from './components/AuthenticatedBookingScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import type { RegistrationResult } from './lib/api';

type Screen = 'login' | 'register' | 'confirmation';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [registration, setRegistration] = useState<RegistrationResult | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleRegistration = (result: RegistrationResult) => {
    setRegistration(result);
    setScreen('confirmation');
  };

  return (
    <div className="min-h-screen bg-[#F1F4F9] text-slate-800 flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 font-sans selection:bg-blue-600 selection:text-white">
      {screen === 'login' && !accessToken && <LoginScreen onNavigateRegister={() => setScreen('register')} onLoginSuccess={setAccessToken} />}
      {screen === 'login' && accessToken && <AuthenticatedBookingScreen accessToken={accessToken} onLogout={() => setAccessToken(null)} />}
      {screen === 'register' && <RegisterScreen onRegisterSuccess={handleRegistration} onNavigateLogin={() => setScreen('login')} />}
      {screen === 'confirmation' && registration && (
        <main className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/70 sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Registro completado</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Tu cuenta fue creada para <strong className="font-semibold text-slate-700">{registration.email}</strong>.</p>
          <button className="mt-7 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700" onClick={() => setScreen('login')} type="button">Ir a iniciar sesión</button>
        </main>
      )}
    </div>
  );
}
