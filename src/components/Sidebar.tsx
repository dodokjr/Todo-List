'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { FiUser, FiUsers, FiPlus, FiLogOut, FiLogIn, FiSidebar } from 'react-icons/fi';

type W = { id: string; name: string; type: string };

const KEY = 'sidebar-open';
const input =
  'min-w-0 flex-1 rounded-xl border border-ink/10 bg-ink/5 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink/40 hover:border-ink/20 focus:border-moss focus:ring-4 focus:ring-moss/15';
const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss';
const iconBtn = `grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink/70 transition hover:bg-ink/5 hover:text-ink ${ring}`;

export default function Sidebar({ name, list }: { name: string; list: W[] }) {
  const path = usePathname();
  const r = useRouter();
  const [open, setOpen] = useState(true);
  const [team, setTeam] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const teamRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  // Ingat pilihan terakhir; default: terbuka di desktop, tertutup di HP
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      setOpen(v ? v === '1' : window.innerWidth >= 768);
    } catch { setOpen(window.innerWidth >= 768); }
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    setErr('');
    try { localStorage.setItem(KEY, next ? '1' : '0'); } catch { /* abaikan */ }
  };

  // Dari mode ikon: buka sidebar lalu fokus ke isian yang dituju
  const openTo = (ref: React.RefObject<HTMLInputElement | null>) => {
    setOpen(true);
    try { localStorage.setItem(KEY, '1'); } catch { /* abaikan */ }
    setTimeout(() => ref.current?.focus(), 60);
  };

  async function go(body: object, set: (s: string) => void) {
    setBusy(true);
    const res = await fetch('/api/workspaces', { method: 'POST', body: JSON.stringify(body) });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error);
    set(''); setErr(''); r.push('/dashboard/' + d.id); r.refresh();
  }
  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team.trim()) return setErr('Isi nama tim dulu.');
    go({ name: team.trim() }, setTeam);
  };
  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setErr('Isi ID tim dulu.');
    go({ code: code.trim() }, setCode);
  };
  async function out() { await fetch('/api/auth/logout', { method: 'POST' }); r.push('/login'); r.refresh(); }

  const submit = `grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-moss text-white shadow-md shadow-moss/20 transition hover:brightness-110 active:scale-95 disabled:opacity-60 ${ring}`;

  return (
    <aside
      className={`flex border-b border-ink/10 bg-card md:sticky md:top-0 md:h-screen md:shrink-0 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:transition-[width] md:duration-200 ${
        open ? 'flex-col gap-5 p-4 md:w-64' : 'flex-row items-center gap-2 p-2 md:w-[4.5rem] md:items-stretch md:gap-5 md:px-3 md:py-4'
      }`}
    >
      {/* Kepala: logo + tombol buka/tutup */}
      <div className={`flex items-center ${open ? '' : 'md:justify-center'}`}>
        {open && <Logo />}
        <button
          onClick={toggle}
          aria-label={open ? 'Tutup sidebar' : 'Buka sidebar'}
          aria-expanded={open}
          title={open ? 'Tutup sidebar' : 'Buka sidebar'}
          className={`${iconBtn} ${open ? 'ml-auto' : ''}`}
        >
          <FiSidebar size={18} />
        </button>
      </div>

      {/* Daftar ruang kerja */}
      {open && <p className="-mb-3 px-3 text-xs text-ink/50">Ruang kerja</p>}
      <nav
        aria-label="Ruang kerja"
        className={`flex min-w-0 gap-1 md:flex-col ${open ? 'flex-col' : 'flex-1 flex-row overflow-x-auto md:flex-none md:overflow-visible'}`}
      >
        {list.map((w) => {
          const active = path.endsWith(w.id);
          const Icon = w.type === 'personal' ? FiUser : FiUsers;
          return (
            <Link
              key={w.id}
              href={'/dashboard/' + w.id}
              title={w.name}
              aria-label={w.name}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center rounded-xl transition ${ring} ${
                open ? 'gap-3 px-3 py-2.5' : 'h-11 w-11 justify-center md:w-full'
              } ${active ? 'bg-moss text-white shadow-md shadow-moss/20' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'}`}
            >
              <Icon size={18} className="shrink-0" />
              {open && <span className="truncate text-sm font-medium">{w.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Buat / gabung tim */}
      {open ? (
        <div className="space-y-2.5 border-t border-ink/10 pt-4">
          <form onSubmit={create} className="flex gap-2">
            <input ref={teamRef} className={input} placeholder="Nama tim baru" aria-label="Nama tim baru" value={team} onChange={(e) => setTeam(e.target.value)} />
            <button type="submit" disabled={busy} className={submit} aria-label="Buat tim"><FiPlus size={18} /></button>
          </form>
          <form onSubmit={join} className="flex gap-2">
            <input ref={codeRef} className={`${input} uppercase`} placeholder="ID tim untuk gabung" aria-label="ID tim untuk gabung" value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="submit" disabled={busy} className={submit} aria-label="Gabung tim"><FiLogIn size={18} /></button>
          </form>
          {err && <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{err}</p>}
        </div>
      ) : (
        <div className="flex gap-1 md:flex-col md:items-center md:border-t md:border-ink/10 md:pt-4">
          <button onClick={() => openTo(teamRef)} className={iconBtn} aria-label="Buat tim" title="Buat tim"><FiPlus size={18} /></button>
          <button onClick={() => openTo(codeRef)} className={iconBtn} aria-label="Gabung tim" title="Gabung tim"><FiLogIn size={18} /></button>
        </div>
      )}

      {/* Pengguna: tema + keluar */}
      {open ? (
        <div className="flex items-center gap-3 rounded-2xl bg-ink/5 p-2.5 md:mt-auto">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-moss text-sm font-semibold text-white" aria-hidden>
            {name.trim()[0]?.toUpperCase() ?? '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <button onClick={out} className={`flex items-center gap-1 rounded text-xs text-ink/60 transition hover:text-rose-500 ${ring}`}>
              <FiLogOut size={12} />Keluar
            </button>
          </div>
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-1 md:mt-auto md:flex-col">
          <ThemeToggle />
          <button onClick={out} className={`${iconBtn} hover:!bg-rose-500/10 hover:!text-rose-500`} aria-label={`Keluar (${name})`} title={`Keluar (${name})`}>
            <FiLogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}