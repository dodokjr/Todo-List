'use client';
import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BAR, type T } from './t';

const NAMA = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MAX = 3; // tugas yang tampil per hari sebelum diringkas

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const thisMonth = () => { const d = new Date(); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)); };

export default function Calendar({ tasks }: { tasks: T[] }) {
  const [m, setM] = useState(thisMonth);
  const [open, setOpen] = useState<string | null>(null);

  const y = m.getUTCFullYear();
  const mo = m.getUTCMonth();
  const first = (m.getUTCDay() + 6) % 7; // Senin = 0
  const dim = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
  const total = Math.ceil((first + dim) / 7) * 7;
  const cells = Array.from({ length: total }, (_, i) => { const d = i - first + 1; return d >= 1 && d <= dim ? d : 0; });
  const key = (d: number) => `${y}-${pad(mo + 1)}-${pad(d)}`;
  const today = ymd(new Date());
  const isCurrent = m.getTime() === thisMonth().getTime();
  const go = (n: number) => { setM(new Date(Date.UTC(y, mo + n, 1))); setOpen(null); };

  // Kelompokkan tugas per tanggal sekali saja
  const byDay = useMemo(() => {
    const map: Record<string, T[]> = {};
    for (const t of tasks) if (t.due) (map[t.due] ||= []).push(t);
    return map;
  }, [tasks]);
  const count = cells.reduce((n, d) => n + (d ? (byDay[key(d)]?.length ?? 0) : 0), 0);

  const nav = 'grid h-10 w-10 place-items-center rounded-xl bg-ink/5 text-ink/70 transition hover:bg-ink/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss';

  return (
    <div className="space-y-4">
      {/* Navigasi bulan */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">{NAMA[mo]} {y}</h2>
          <p className="text-xs text-ink/50">{count ? `${count} tugas dengan tenggat bulan ini` : 'Belum ada tenggat bulan ini'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {!isCurrent && (
            <button onClick={() => { setM(thisMonth()); setOpen(null); }} className="mr-1 rounded-xl bg-moss/10 px-3.5 py-2 text-sm font-medium text-moss transition hover:bg-moss/20">
              Hari ini
            </button>
          )}
          <button className={nav} aria-label="Bulan sebelumnya" onClick={() => go(-1)}><FiChevronLeft size={18} /></button>
          <button className={nav} aria-label="Bulan berikutnya" onClick={() => go(1)}><FiChevronRight size={18} /></button>
        </div>
      </div>

      {/* Grid kalender */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {HARI.map((d, i) => (
          <div key={d} className={`pb-1 text-center text-xs font-medium ${i > 4 ? 'text-ink/35' : 'text-ink/55'}`}>{d}</div>
        ))}

        {cells.map((d, i) => {
          if (!d) return <div key={i} className="min-h-16 rounded-xl bg-ink/[0.02] sm:min-h-28" />;
          const k = key(d);
          const list = byDay[k] ?? [];
          const expanded = open === k;
          const shown = expanded ? list : list.slice(0, MAX);
          const rest = list.length - shown.length;
          const isToday = k === today;
          const weekend = i % 7 > 4;

          return (
            <div
              key={i}
              className={`min-h-16 rounded-xl p-1.5 ring-1 transition sm:min-h-28 sm:p-2 ${isToday ? 'bg-moss/[0.06] ring-2 ring-moss' : `ring-ink/10 ${weekend ? 'bg-ink/[0.03]' : 'bg-card'}`}`}
            >
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${isToday ? 'bg-moss font-semibold text-white' : weekend ? 'text-ink/40' : 'text-ink/70'}`}>{d}</span>

              <div className="mt-1 flex flex-wrap gap-1 sm:block sm:space-y-1">
                {shown.map((t) => {
                  const done = t.status === 'done';
                  const late = !done && k < today;
                  return (
                    <div
                      key={t.id}
                      title={t.title}
                      className={`flex items-center gap-1.5 rounded-md text-[11px] leading-tight sm:bg-ink/5 sm:px-1.5 sm:py-1 ${done ? 'opacity-50 sm:line-through' : ''} ${late ? 'sm:text-rose-500' : ''}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${BAR[t.priority]}`} />
                      <span className="hidden truncate sm:inline">{t.title}</span>
                    </div>
                  );
                })}
                {(rest > 0 || expanded) && list.length > MAX && (
                  <button
                    onClick={() => setOpen(expanded ? null : k)}
                    className="rounded-md px-1 text-[11px] text-moss hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                  >
                    {expanded ? 'Ringkas' : `+${rest} lagi`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}