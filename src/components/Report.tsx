'use client';
import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import type { Ev } from '@/lib/types';
import type { T } from './t';
const hm = (s: number) => `${Math.floor(s / 3600)}j ${Math.floor((s % 3600) / 60)}m`;
function Bars({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <section className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-ink/10">
      <h3 className="font-medium">{title}</h3>
      {rows.length === 0 && <p className="text-sm text-ink/50">Belum ada data.</p>}
      {rows.map(([k, v]) => <div key={k} className="space-y-0.5 text-sm"><div className="flex justify-between gap-2"><span className="truncate">{k}</span><span className="shrink-0 font-mono text-xs text-ink/70">{hm(v)}</span></div><div className="h-2 rounded bg-ink/5"><div className="h-2 rounded bg-moss" style={{ width: `${(v / max) * 100}%` }} /></div></div>)}
    </section>
  );
}
// Laporan waktu dari entri timer (dicatat tiap timer dihentikan)
export default function Report({ events, tasks, nameOf }: { events: Ev[]; tasks: T[]; nameOf: (u: string) => string }) {
  const [days, setDays] = useState(7);
  const cut = days ? new Date(Date.now() - days * 86400000).toISOString() : '';
  const f = events.filter((e) => e.type === 'time' && e.createdAt >= cut);
  const title = (id: string) => tasks.find((t) => t.id === id)?.title || '(tugas dihapus)';
  const sum = (key: (e: Ev) => string) => { const m = new Map<string, number>(); f.forEach((e) => m.set(key(e), (m.get(key(e)) || 0) + Number(e.data || 0))); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
  const total = f.reduce((a, e) => a + Number(e.data || 0), 0);
  const csv = () => {
    const rows = [['Tanggal', 'Anggota', 'Tugas', 'Durasi (detik)', 'Durasi (jam)'], ...f.map((e) => [e.createdAt.slice(0, 10), nameOf(e.userId), title(e.taskId), e.data, (Number(e.data) / 3600).toFixed(2)])];
    const body = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + body], { type: 'text/csv;charset=utf-8' })); a.download = `laporan-waktu-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg ring-1 ring-ink/20">{[[7, '7 hari'], [30, '30 hari'], [0, 'Semua']].map(([d, l]) => <button key={d} onClick={() => setDays(d as number)} className={`px-3 py-2 text-sm ${days === d ? 'bg-moss text-white' : ''}`}>{l}</button>)}</div>
        <p className="text-sm">Total: <b className="font-mono">{hm(total)}</b></p>
        <button onClick={csv} disabled={!f.length} className="btn ml-auto flex items-center gap-1"><FiDownload />Ekspor CSV</button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Bars title="Per anggota" rows={sum((e) => nameOf(e.userId))} />
        <Bars title="Per tugas" rows={sum((e) => title(e.taskId))} />
        <Bars title="Per hari" rows={sum((e) => e.createdAt.slice(0, 10)).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14)} />
      </div>
    </div>
  );
}
