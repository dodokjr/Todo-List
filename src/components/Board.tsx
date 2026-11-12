'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiPlus, FiTrash2, FiCopy, FiCheck, FiUsers, FiUser, FiEdit2, FiSearch,
  FiColumns, FiBarChart2, FiCalendar, FiPieChart,
} from 'react-icons/fi';
import Members, { type M } from './Members';
import Select from './Select';
import TaskCard from './TaskCard';
import Timeline from './Timeline';
import Calendar from './Calendar';
import Report from './Report';
import type { Ev } from '@/lib/types';
import { COLS, type T } from './t';

type Props = { ws: { id: string; name: string; type: string; code: string }; init: T[]; me: string; isAdmin: boolean };

const VIEWS = [
  ['board', 'Papan', FiColumns],
  ['timeline', 'Timeline', FiBarChart2],
  ['calendar', 'Kalender', FiCalendar],
  ['report', 'Laporan', FiPieChart],
] as const;

// Penanda warna per kolom (urutan mengikuti COLS)
const DOTS = ['bg-ink/30', 'bg-accent', 'bg-moss'];

const field =
  'rounded-xl border border-ink/10 bg-ink/5 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink/40 hover:border-ink/20 focus:border-moss focus:ring-4 focus:ring-moss/15';

const PRIOS = [
  { value: 'low', label: 'Rendah' },
  { value: 'med', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
];

export default function Board({ ws, init, me, isAdmin }: Props) {
  const r = useRouter();
  const team = ws.type === 'team';
  const [tasks, setTasks] = useState(init);
  const [view, setView] = useState<string>('board');
  const [title, setTitle] = useState('');
  const [pr, setPr] = useState('med');
  const [due, setDue] = useState('');
  const [as, setAs] = useState('');
  const [ms, setMs] = useState<M[]>([]);
  const [q, setQ] = useState('');
  const [mine, setMine] = useState(false);
  const [evs, setEvs] = useState<Ev[]>([]);
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(false);
  const [err, setErr] = useState('');
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [tried, setTried] = useState(false); // sudah coba kirim form dengan isian kosong
  const [col, setCol] = useState<string>(COLS[0][0]); // kolom aktif di mobile
  const swipe = useRef<[number, number] | null>(null);
  const [ren, setRen] = useState(false); // modal ganti nama
  const [name, setName] = useState('');
  const [renErr, setRenErr] = useState('');
  const [saving, setSaving] = useState(false);

  const url = `/api/workspaces/${ws.id}/tasks`;
  const logUrl = `/api/workspaces/${ws.id}/log`;
  const loadLog = useCallback(async () => { const x = await fetch(logUrl); if (x.ok) setEvs(await x.json()); }, [logUrl]);
  const gone = useCallback(() => { r.push('/dashboard'); r.refresh(); }, [r]);
  const load = useCallback(async () => {
    const x = await fetch(url);
    if (x.ok) setTasks(await x.json());
    else if (x.status === 403) gone();
  }, [url, gone]);

  // Real-time lewat SSE; polling 30 detik sebagai cadangan
  useEffect(() => {
    const es = new EventSource(`/api/workspaces/${ws.id}/events`);
    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false);
    es.onmessage = (e) => {
      if (e.data === 'ping') return;
      if (e.data === 'log') { loadLog(); return; }
      load();
      if (e.data === 'members' || e.data === 'ws') { setTick((t) => t + 1); r.refresh(); }
    };
    const i = setInterval(load, 30000);
    return () => { es.close(); clearInterval(i); };
  }, [ws.id, load, loadLog, r]);
  useEffect(() => { loadLog(); }, [loadLog]);
  useEffect(() => {
    if (team) fetch(`/api/workspaces/${ws.id}/members`).then((x) => (x.ok ? x.json() : [])).then(setMs);
  }, [ws.id, team, tick]);

  useEffect(() => {
    if (!ren) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setRen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [ren]);

  const running = tasks.some((t) => !!t.timerStart);
  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [running]);

  // Semua isian wajib diisi; kalau ada yang kosong, request tidak dijalankan
  const missing = [!title.trim() && 'judul', !due && 'tenggat', team && !as && 'penanggung jawab'].filter(Boolean) as string[];
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missing.length) { setTried(true); return; }
    const x = await fetch(url, { method: 'POST', body: JSON.stringify({ title: title.trim(), priority: pr, due, assignee: as }) });
    if (!x.ok) { setErr((await x.json().catch(() => ({}))).error || 'Gagal menambah tugas'); return; }
    setErr(''); setTitle(''); setDue(''); setAs(''); setTried(false); load();
  };
  const patch = (id: string, p: Partial<T>) => {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...p } : x)));
    fetch('/api/tasks/' + id, { method: 'PATCH', body: JSON.stringify(p) });
  };
  const del = (id: string) => {
    setTasks((t) => t.filter((x) => x.id !== id));
    fetch('/api/tasks/' + id, { method: 'DELETE' });
  };
  const timer = async (id: string, action: 'start' | 'stop') => {
    await fetch(`/api/tasks/${id}/timer`, { method: 'POST', body: JSON.stringify({ action }) });
    setNow(Date.now()); load();
  };
  const send = (method: string, body: object) => fetch(logUrl, { method, body: JSON.stringify(body) }).then(loadLog);
  const nameOf = (u: string) => (u === me ? 'Kamu' : ms.find((m) => m.userId === u)?.name || 'Anggota');
  const tpls = evs.filter((e) => e.type === 'template');
  const openRename = () => { setName(ws.name); setRenErr(''); setRen(true); };
  const rename = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (n === ws.name) return setRen(false);
    setSaving(true); setRenErr('');
    const x = await fetch('/api/workspaces/' + ws.id, { method: 'PATCH', body: JSON.stringify({ name: n }) });
    setSaving(false);
    if (!x.ok) return setRenErr((await x.json()).error);
    setRen(false); r.refresh();
  };
  const remove = async () => {
    if (!confirm('Hapus tim beserta semua tugasnya?')) return;
    const x = await fetch('/api/workspaces/' + ws.id, { method: 'DELETE' });
    if (x.ok) gone(); else setErr((await x.json()).error);
  };
  const copy = () => {
    navigator.clipboard.writeText(ws.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const today = new Date().toISOString().slice(0, 10);
  const vis = tasks.filter((t) => (!q || t.title.toLowerCase().includes(q.toLowerCase())) && (!mine || t.assignee === me));
  const tabs = [
    ...COLS.map(([k, l]) => ({ k: k as string, l, n: vis.filter((t) => t.status === k).length })),
    ...(team ? [{ k: 'members', l: 'Anggota', n: ms.length }] : []),
  ];

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-moss/10 text-moss">
          {team ? <FiUsers size={20} /> : <FiUser size={20} />}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">{ws.name}</h1>
          <p className="flex items-center gap-1.5 text-xs text-ink/50" title={live ? 'Terhubung real-time' : 'Menyambung ulang...'}>
            <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-moss' : 'bg-ink/30'}`} />
            {live ? 'Tersinkron langsung' : 'Menyambung ulang...'}
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {team && (
            <button onClick={copy} className="flex items-center gap-2 rounded-xl bg-ink/5 px-3 py-2 text-sm transition hover:bg-ink/10">
              {copied ? <FiCheck className="text-moss" /> : <FiCopy className="text-ink/50" />}
              <span className="text-ink/60">ID tim</span> <b>{copied ? 'Tersalin' : ws.code}</b>
            </button>
          )}
          {team && isAdmin && (
            <>
              <button onClick={openRename} aria-label="Ganti nama" className="grid h-9 w-9 place-items-center rounded-xl text-ink/60 transition hover:bg-ink/10 hover:text-ink"><FiEdit2 /></button>
              <button onClick={remove} aria-label="Hapus tim" className="grid h-9 w-9 place-items-center rounded-xl text-rose-500 transition hover:bg-rose-500/10"><FiTrash2 /></button>
            </>
          )}
        </div>
      </header>

      {err && <p role="alert" className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">{err}</p>}

      {/* Tambah tugas */}
      <form onSubmit={add} className="grid grid-cols-2 gap-2 rounded-2xl border border-ink/10 bg-ink/[0.03] p-2 sm:flex sm:flex-wrap">
        <input
          aria-invalid={tried && !title.trim() ? true : undefined}
          className={`col-span-2 min-w-0 rounded-xl bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-ink/40 sm:flex-1 sm:basis-56 sm:text-[15px] ${tried && !title.trim() ? 'ring-1 ring-rose-500/60' : ''}`}
          placeholder="Tambah tugas baru..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select label="Prioritas" value={pr} onChange={setPr} options={PRIOS} />
        <input type="date" className={`${field} min-w-0 sm:w-auto ${tried && !due ? '!border-rose-500/60' : ''}`} aria-invalid={tried && !due ? true : undefined} value={due} onChange={(e) => setDue(e.target.value)} aria-label="Tenggat" />
        {team && (
          <Select
            className="col-span-2 sm:col-span-1"
            label="Penanggung jawab"
            invalid={tried && !as}
            value={as}
            onChange={setAs}
            options={[{ value: '', label: 'Pilih penanggung jawab' }, ...ms.map((m) => ({ value: m.userId, label: m.name }))]}
          />
        )}
        <button className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-moss px-4 py-3 text-sm font-medium text-white shadow-md shadow-moss/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-moss/30 active:scale-[0.97] sm:col-span-1 sm:py-2.5">
          <FiPlus />Tambah
        </button>
      </form>
      {tried && missing.length > 0 && (
        <p role="alert" className="-mt-3 rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">Lengkapi dulu: {missing.join(', ')}.</p>
      )}

      {/* Tampilan + pencarian */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex w-full rounded-xl bg-ink/5 p-1 sm:w-auto">
          {VIEWS.map(([k, l, Ic]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              aria-pressed={view === k}
              aria-label={l}
              title={l}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition sm:flex-none sm:py-1.5 ${view === k ? 'bg-moss text-white shadow-sm' : 'text-ink/70 hover:text-ink'}`}
            >
              <Ic size={16} /><span className="hidden sm:inline">{l}</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
          <input className={`${field} w-full pl-10 text-base sm:text-sm`} placeholder="Cari tugas..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {team && (
          <button
            onClick={() => setMine(!mine)}
            aria-pressed={mine}
            className={`rounded-xl px-3.5 py-2.5 text-sm transition ${mine ? 'bg-moss/10 text-moss ring-1 ring-moss/40' : 'bg-ink/5 text-ink/70 hover:text-ink'}`}
          >
            Tugas saya
          </button>
        )}
      </div>

      {view === 'timeline' && <Timeline tasks={vis} />}
      {view === 'calendar' && <Calendar tasks={vis} />}
      {view === 'report' && <Report events={evs} tasks={tasks} nameOf={nameOf} />}
      {view === 'board' && (
        <div
          onTouchStart={(e) => { const t = e.touches[0]; swipe.current = [t.clientX, t.clientY]; }}
          onTouchEnd={(e) => {
            const s0 = swipe.current; swipe.current = null;
            if (!s0 || window.innerWidth >= 768 || (e.target as HTMLElement).closest('input,select,textarea,[role=listbox]')) return;
            const t = e.changedTouches[0]; const dx = t.clientX - s0[0]; const dy = t.clientY - s0[1];
            if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
            const i = tabs.findIndex((x) => x.k === col) + (dx < 0 ? 1 : -1);
            if (tabs[i]) setCol(tabs[i].k);
          }}
          className="space-y-4"
        >
          {/* Tab kolom (khusus mobile) */}
          <div role="tablist" className="grid gap-1 rounded-xl bg-ink/5 p-1 md:hidden" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map((x) => (
              <button
                key={x.k}
                role="tab"
                aria-selected={col === x.k}
                onClick={() => setCol(x.k)}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm transition ${col === x.k ? 'bg-moss text-white shadow-sm' : 'text-ink/70'}`}
              >
                <span className="truncate">{x.l}</span>
                <span className={`rounded-full px-1.5 text-xs ${col === x.k ? 'bg-white/20' : 'bg-ink/10'}`}>{x.n}</span>
              </button>
            ))}
          </div>

          <div className={`grid items-start gap-4 md:grid-cols-3 ${team ? 'xl:grid-cols-4' : ''}`}>
            {COLS.map(([k, label], i) => {
              const list = vis.filter((t) => t.status === k);
              return (
                <section key={k} className={`space-y-2.5 rounded-2xl border border-ink/5 bg-ink/[0.04] p-3 md:block ${col === k ? '' : 'hidden'}`}>
                  <h2 className="hidden items-center gap-2 px-1 pb-1 text-sm font-medium md:flex">
                    <span className={`h-2 w-2 rounded-full ${DOTS[i] ?? 'bg-ink/30'}`} />
                    {label}
                    <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/60">{list.length}</span>
                  </h2>
                  {list.map((t) => (
                    <TaskCard
                      key={t.id} t={t} team={team} ms={ms} today={today} now={now} me={me} nameOf={nameOf}
                      evs={evs.filter((e) => e.taskId === t.id && e.type !== 'time')}
                      tpls={tpls} patch={patch} del={del} timer={timer}
                      comment={(id, text) => send('POST', { taskId: id, text })}
                      saveTpl={(name, items) => send('POST', { kind: 'template', text: name, data: JSON.stringify(items) })}
                      delEv={(id) => send('DELETE', { id })}
                    />
                  ))}
                  {list.length === 0 && (
                    <p className="rounded-xl border border-dashed border-ink/10 px-3 py-8 text-center text-sm text-ink/40">Belum ada tugas</p>
                  )}
                </section>
              );
            })}
            {team && (
              <div className={`md:block ${col === 'members' ? '' : 'hidden'}`}>
                <Members wid={ws.id} me={me} isAdmin={isAdmin} ms={ms} onGone={gone} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    {ren && (
      <div
        className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-4 backdrop-blur-sm sm:place-items-center"
        onMouseDown={(e) => { if (e.target === e.currentTarget) setRen(false); }}
      >
        <form
          onSubmit={rename}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ren-title"
          className="w-full max-w-sm space-y-4 rounded-3xl border border-ink/10 bg-card p-6 shadow-2xl"
        >
          <div className="space-y-1">
            <h2 id="ren-title" className="font-display text-xl font-semibold tracking-tight">Ganti nama tim</h2>
            <p className="text-sm text-ink/60">Nama baru akan terlihat oleh semua anggota.</p>
          </div>
          <input
            autoFocus
            onFocus={(e) => e.target.select()}
            className={`${field} w-full text-base`}
            placeholder="Nama tim"
            aria-label="Nama tim"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {renErr && <p role="alert" className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">{renErr}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRen(false)} className="rounded-xl px-4 py-2.5 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink">Batal</button>
            <button
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 rounded-xl bg-moss px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-moss/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-moss/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    )}
    </>
  );
}