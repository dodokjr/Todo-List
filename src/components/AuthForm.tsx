'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FiArrowLeft, FiCheck, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff,
  FiKey, FiLock, FiMail, FiUser, FiGrid, FiUsers, FiClock,
} from 'react-icons/fi';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

type Field = 'name' | 'email' | 'password' | 'token';

const C: Record<string, { t: string; sub: string; api: string; f: Field[]; btn: string }> = {
  login: { t: 'Masuk', sub: 'Lanjutkan ke papan kerjamu.', api: 'login', f: ['email', 'password'], btn: 'Masuk' },
  register: { t: 'Buat akun', sub: 'Gratis, cukup beberapa detik.', api: 'register', f: ['name', 'email', 'password'], btn: 'Daftar' },
  'forgot-password': { t: 'Lupa password', sub: 'Masukkan email, kami kirim token untuk reset.', api: 'forgot', f: ['email'], btn: 'Kirim token' },
  'reset-password': { t: 'Reset password', sub: 'Isi token dari email dan password barumu.', api: 'reset', f: ['email', 'token', 'password'], btn: 'Simpan password baru' },
};

const L: Record<Field, { label: string; type: string; icon: React.ElementType }> = {
  name: { label: 'Nama', type: 'text', icon: FiUser },
  email: { label: 'Email', type: 'email', icon: FiMail },
  password: { label: 'Password (min. 6 karakter)', type: 'password', icon: FiLock },
  token: { label: 'Token dari email', type: 'text', icon: FiKey },
};

const FEATURES = [
  { icon: FiGrid, text: 'Papan, timeline, dan kalender' },
  { icon: FiUsers, text: 'Tim real-time dengan role admin' },
  { icon: FiClock, text: 'Timer dan checklist di setiap tugas' },
];

const PREVIEW = [
  { t: 'Susun jadwal minggu ini', done: true },
  { t: 'Review desain dengan tim', done: true },
  { t: 'Kirim laporan ke klien', done: false },
];

export default function AuthForm({ mode, token, email }: { mode: string; token?: string; email?: string }) {
  const c = C[mode];
  const r = useRouter();
  const [v, setV] = useState<Record<string, string>>({ token: token || '', email: email || '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    const res = await fetch('/api/auth/' + c.api, { method: 'POST', body: JSON.stringify(v) });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error);
    if (c.api === 'forgot') return setMsg(d.dev ? `Mode dev, token kamu: ${d.dev}` : 'Jika email terdaftar, token sudah dikirim. Berlaku 15 menit.');
    r.push(c.api === 'reset' ? '/login' : '/dashboard'); r.refresh();
  }

  const hi = mode === 'register' ? 'Mulai rapikan harimu' : mode === 'login' ? 'Selamat datang kembali' : 'Tenang, kita pulihkan akunmu';
  const done = PREVIEW.filter((p) => p.done).length;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes auth-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
          .auth-in { animation: auth-in .6s cubic-bezier(.2,.7,.2,1) both; }
        }
      `}</style>

      {/* Panel kiri */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-moss p-12 text-white lg:flex xl:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full bg-accent/30 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, black, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 80%)',
          }}
        />

        <div className="relative"><Logo light /></div>

        <div className="relative max-w-lg space-y-10">
          <h2 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight xl:text-6xl">
            Kerjakan lebih banyak, dengan lebih tenang.
          </h2>

          {/* Pratinjau tugas */}
          <div className="auth-in rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl shadow-black/10 backdrop-blur-md" style={{ animationDelay: '.15s' }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium">Hari ini</p>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">{done}/{PREVIEW.length} selesai</span>
            </div>
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${(done / PREVIEW.length) * 100}%` }} />
            </div>
            <ul className="space-y-2.5">
              {PREVIEW.map((p) => (
                <li key={p.t} className="flex items-center gap-3 text-sm">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${p.done ? 'border-white bg-white text-moss' : 'border-white/50'}`}>
                    {p.done && <FiCheck size={12} strokeWidth={3} />}
                  </span>
                  <span className={p.done ? 'text-white/60 line-through' : ''}>{p.t}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-3.5 text-white/90">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><Icon size={16} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">Gratis untuk dipakai sendiri atau bersama tim.</p>
      </aside>

      {/* Panel kanan */}
      <section className="relative grid place-items-center px-5 pb-10 pt-24 sm:px-6">
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6">
          <Link href="/" className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss">
            <FiArrowLeft className="transition group-hover:-translate-x-0.5" />Beranda
          </Link>
          <ThemeToggle />
        </div>

        <form
          onSubmit={submit}
          className="auth-in w-full max-w-md space-y-5 rounded-3xl border border-ink/10 bg-ink/[0.03] p-7 shadow-xl shadow-moss/5 backdrop-blur sm:p-9"
        >
          <div className="lg:hidden"><Logo /></div>

          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-2 rounded-full bg-moss/10 px-3 py-1 text-sm text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" />{hi}
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight">{c.t}</h1>
            <p className="text-sm text-ink/60">{c.sub}</p>
          </div>

          <div className="space-y-3">
            {c.f.map((f) => {
              const { label, type, icon: Icon } = L[f];
              const isPw = f === 'password';
              return (
                <label key={f} className="group relative block">
                  <span className="sr-only">{label}</span>
                  <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 transition group-focus-within:text-moss" size={18} />
                  <input
                    className={`w-full rounded-xl border border-ink/10 bg-ink/5 py-3.5 pl-11 text-[15px] outline-none transition placeholder:text-ink/40 hover:border-ink/20 focus:border-moss focus:bg-transparent focus:ring-4 focus:ring-moss/15 ${isPw ? 'pr-12' : 'pr-4'}`}
                    required
                    placeholder={label}
                    type={isPw && show ? 'text' : type}
                    value={v[f] || ''}
                    autoComplete={isPw ? (mode === 'login' ? 'current-password' : 'new-password') : undefined}
                    onChange={(e) => setV({ ...v, [f]: e.target.value })}
                  />
                  {isPw && (
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                    >
                      {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  )}
                </label>
              );
            })}
          </div>

          {err && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">
              <FiAlertCircle className="mt-0.5 shrink-0" />{err}
            </p>
          )}
          {msg && (
            <p role="status" className="flex items-start gap-2 break-all rounded-xl bg-moss/10 px-3.5 py-2.5 text-sm text-moss">
              <FiCheckCircle className="mt-0.5 shrink-0" />{msg}
            </p>
          )}

          <button
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-moss px-4 py-3.5 font-medium text-white shadow-lg shadow-moss/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-moss/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {busy ? 'Memproses...' : c.btn}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-ink/10 pt-5 text-sm text-ink/70 [&_a]:transition [&_a:hover]:text-ink">
            {mode === 'login' ? (
              <>
                <Link href="/register">Belum punya akun? <b className="text-moss">Daftar</b></Link>
                <Link href="/forgot-password">Lupa password?</Link>
              </>
            ) : mode === 'register' ? (
              <Link href="/login">Sudah punya akun? <b className="text-moss">Masuk</b></Link>
            ) : mode === 'forgot-password' ? (
              <>
                <Link href="/login">Kembali ke masuk</Link>
                <Link href={`/reset-password${v.email ? '?email=' + encodeURIComponent(v.email) : ''}`}>Sudah punya token?</Link>
              </>
            ) : (
              <Link href="/login">Kembali ke masuk</Link>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}