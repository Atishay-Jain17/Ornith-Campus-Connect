'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, MapPin, ArrowUpRight, Radio, UsersRound } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('Graphic Era Area');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, area }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not sign in. Please try again.');
      window.dispatchEvent(new CustomEvent('ornith:auth-changed', { detail: { user: result.user } }));
      router.replace('/feed');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[calc(100dvh-56px)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 sm:py-5 bg-[#F0EFFA]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1.08fr_.92fr] min-h-[540px] overflow-hidden rounded-[24px] border border-[#D8D8F6] bg-white shadow-[0_18px_55px_rgba(30,30,36,.12)]">
        <section className="relative overflow-hidden bg-[#57886C] px-6 py-8 sm:px-10 sm:py-8 lg:px-14 lg:py-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#EDCB96]"><span className="w-2 h-2 rounded-full bg-[#ED6A5A]" /> Graphic Era University <span className="text-white/45">/</span> Dehradun</div>
            <p className="mt-9 lg:mt-14 text-xs font-bold uppercase tracking-[.2em] text-white/70">Your people are closer than you think.</p>
            <h1 className="mt-4 max-w-[540px] font-serif text-[clamp(2.5rem,4.8vw,5.35rem)] leading-[.98] tracking-[-.055em] text-white">
              Good things<br />happen <span className="relative inline-block text-[#ED6A5A]">close by<span className="absolute left-0 -bottom-1 h-[5px] w-[92%] bg-[#EDCB96] -rotate-2" /></span>.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-white/80">A charger for tonight. A lift after class. People for lunch. ORNITH makes campus life feel a little more connected.</p>
          </div>

          <div className="relative mt-7 lg:mt-10 min-h-[195px] lg:min-h-[230px] overflow-hidden rounded-2xl bg-[#D8D8F6] py-5">
            <div className="absolute left-4 top-4 z-10 text-[10px] font-bold uppercase tracking-[.18em] text-[#1E1E24]/60">Around your campus</div>
            <svg viewBox="0 0 520 240" className="absolute inset-x-0 bottom-0 h-[175px] lg:h-[215px] w-full" role="img" aria-label="Illustrated campus map with nearby community spots">
              <path d="M-8 183 C66 172 68 99 143 115 S229 200 300 154 384 64 536 85" fill="none" stroke="#ED6A5A" strokeWidth="23" strokeLinecap="round" />
              <path d="M-8 183 C66 172 68 99 143 115 S229 200 300 154 384 64 536 85" fill="none" stroke="#F5E4BF" strokeWidth="2" strokeDasharray="6 10" strokeLinecap="round" />
              <path d="M83 244 C135 186 169 162 181 112 S206 41 269 9 M335 247 C337 201 364 183 420 173 S483 149 520 122" fill="none" stroke="#57886C" strokeOpacity=".34" strokeWidth="2" />
              <path d="M18 78l57-20 22 36-54 25zM272 51l48-17 16 37-52 19zM365 209l36-32 43 14-11 34z" fill="#D8D8F6" fillOpacity=".72" />
              <path d="M222 215l16-38 48 4 18 39-30 13zM433 35l37-17 30 30-19 32-39-8z" fill="#57886C" fillOpacity=".18" />
              <circle cx="143" cy="115" r="12" fill="#1E1E24" stroke="#D8D8F6" strokeWidth="5" />
              <circle cx="300" cy="154" r="9" fill="#57886C" stroke="#D8D8F6" strokeWidth="5" />
              <circle cx="420" cy="173" r="8" fill="#EDCB96" stroke="#D8D8F6" strokeWidth="4" />
            </svg>
            <div className="absolute left-[19%] top-[48%] bg-white px-3 py-2 rounded-lg shadow-sm border border-white">
              <p className="text-[10px] font-bold text-[#1E1E24]">GEU Gate 1</p><p className="text-[10px] text-[#1E1E24]/50">A familiar meeting point</p>
            </div>
            <div className="absolute right-[3%] bottom-[5%] flex items-center gap-2 bg-[#1E1E24] px-3 py-2 text-white shadow-md">
              <MapPin className="w-3.5 h-3.5 text-[#EDCB96]" /><span className="text-[10px] font-semibold">People, just around the corner</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-white/70">
            <span className="inline-flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-[#ED6A5A]" /> Nearby by design</span>
            <span className="inline-flex items-center gap-1.5"><UsersRound className="w-3.5 h-3.5 text-[#57886C]" /> Built for campus life</span>
          </div>
        </section>

        <section className="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-14">
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#57886C]"><Sparkles className="w-3.5 h-3.5" /> The campus, a little closer</div>
            <h2 className="mt-5 font-serif text-4xl tracking-tight text-[#1E1E24]">{mode === 'login' ? 'Come on in.' : 'Find your people.'}</h2>
            <p className="mt-2 text-sm text-[#1E1E24]/55">{mode === 'login' ? 'Pick up where your community left off.' : 'Start with your campus email. We’ll take it from there.'}</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === 'register' && <>
                <Field label="Your name" value={name} onChange={setName} autoComplete="name" required />
                <Field label="Campus area" value={area} onChange={setArea} autoComplete="address-level3" required />
              </>}
              <Field label="Campus email" value={email} onChange={setEmail} type="email" autoComplete="email" required />
              <Field label="Password" value={password} onChange={setPassword} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required />
              {mode === 'register' && <p className="flex gap-2 border-l-2 border-[#57886C] pl-3 text-xs leading-relaxed text-[#1E1E24]/60"><ShieldCheck className="w-4 h-4 shrink-0 text-[#57886C]" /> Campus verification stays pending until reviewed. Opportunity posting opens at verified Level 5.</p>}
              {error && <p role="alert" className="border-l-2 border-[#ED6A5A] bg-[#ED6A5A]/5 px-3 py-2.5 text-sm text-[#9b3d33]">{error}</p>}
              <button type="submit" disabled={busy} className="group mt-2 flex w-full items-center justify-between rounded-xl bg-[#ED6A5A] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#d95647] disabled:opacity-60">
                <span>{busy ? 'One moment…' : mode === 'login' ? 'Sign in to ORNITH' : 'Create your account'}</span><ArrowUpRight className="w-4 h-4 text-[#EDCB96] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <div className="flex items-center gap-3 py-1"><span className="h-px flex-1 bg-[#1E1E24]/10" /><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#1E1E24]/35">or</span><span className="h-px flex-1 bg-[#1E1E24]/10" /></div>
              <p className="text-sm text-[#1E1E24]/55">
                {mode === 'login' ? 'New around here?' : 'Already part of ORNITH?'}{' '}
                <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="font-bold text-[#ED6A5A] underline decoration-[#ED6A5A]/40 underline-offset-4 hover:decoration-[#ED6A5A]">
                  {mode === 'login' ? 'Create an account' : 'Sign in'}
                </button>
              </p>
            </form>

            <div className="mt-10 border-t border-[#1E1E24]/10 pt-4 text-[11px] leading-5 text-[#1E1E24]/45">Your phone number stays private. Meet nearby people through campus posts and in-app chat.</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', ...props }: { label: string; value: string; onChange: (value: string) => void; type?: string; [key: string]: any }) {
  return <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#1E1E24]/60">{label}<input {...props} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-[#dedace] bg-[#f8f6f0] px-3.5 py-3.5 text-sm font-medium text-[#1E1E24] outline-none transition-colors placeholder:text-[#1E1E24]/35 focus:border-[#57886C] focus:bg-white" /></label>;
}
