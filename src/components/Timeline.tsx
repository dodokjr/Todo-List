'use client';
import { useEffect, useRef, useState } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BAR, type T } from './t';

const D = 86400000;
const COL = 1.9; // lebar minimum satu hari (rem)
const NAMA = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI = ['M', 'S', 'S', 'R', 'K', 'J', 'S']; // Minggu, Senin, ... Sabtu

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => d.toISOString().slice(0, 10);
const localIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtStr = (s: string) => { const d = new Date(s); return `${d.getUTCDate()} ${BLN[d.getUTCMonth()]}`; };
const thisMonth = () => { const d = new Date(); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)); };

// Timeline per bulan: bar dari tanggal Mulai sampai Tenggat (kalau salah satunya kosong, bar 1 hari)
export default function Timeline({ tasks }: { tasks: T[] }) {
  const [m, setM] = useState(thisMonth);
  const scroller = useRef<HTMLDivElement>(null);

  const y = m.getUTCFullYear();
  const mo = m.getUTCMonth();
  const dim = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
  const days = Array.from({ length: dim }, (_, i) => new Date(Date.UTC(y, mo, i + 1)));
  const cols = `repeat(${dim}, minmax(${COL}rem, 1fr))`;
  const idx = (s: string) => Math.round((Date.parse(s) - m.getTime()) / D);
  const today = localIso(new Date());
  const ti = idx(today);
  const isCurrent = m.getTime() === thisMonth().getTime();
  const go = (n: number) => setM(new Date(Date.UTC(y, mo + n, 1)));

  // Hanya tugas yang rentangnya menyentuh bulan ini
  const span = (t: T) => {
    let s = idx(t.start || t.due), e = idx(t.due || t.start);
    if (e < s) [s, e] = [e, s];
    return { s, e, inView: e >= 0 && s <= dim - 1 };
  };
  const hasDated = tasks.some((t) => t.due || t.start);
  const rows = tasks
    .filter((t) => (t.due || t.start) && span(t).inView)
    .sort((a, b) => (a.start || a.due).localeCompare(b.start || b.due));

  // Di layar kecil, geser otomatis supaya kolom hari ini terlihat
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    el.scrollLeft = ti >= 0 && ti < dim ? Math.max(0, (ti - 1) * COL * rem) : 0;
  }, [ti, dim, rows.length > 0]);

  const nav = 'grid h-10 w-10 place-items-center rounded-xl bg-ink/5 text-ink/70 transition hover:bg-ink/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">{NAMA[mo]} {y}</h2>
          <p className="text-xs text-ink/50">{rows.length ? `${rows.length} tugas di bulan ini` : 'Tidak ada tugas di bulan ini'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {!isCurrent && (
            <button onClick={() => setM(thisMonth())} className="mr-1 rounded-xl bg-moss/10 px-3.5 py-2 text-sm font-medium text-moss transition hover:bg-moss/20">
              Hari ini
            </button>
          )}
          <button className={nav} aria-label="Bulan sebelumnya" onClick={() => go(-1)}><FiChevronLeft size={18} /></button>
          <button className={nav} aria-label="Bulan berikutnya" onClick={() => go(1)}><FiChevronRight size={18} /></button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl bg-card px-6 py-14 text-center ring-1 ring-ink/10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-moss/10 text-moss"><FiCalendar size={22} /></span>
          <p className="font-medium">{hasDated ? `Tidak ada tugas di ${NAMA[mo]}` : 'Belum ada tugas bertanggal'}</p>
          <p className="max-w-xs text-sm text-ink/60">
            {hasDated ? 'Pakai tombol panah untuk melihat bulan lain.' : 'Isi Mulai atau Tenggat di tampilan Papan, lalu tugasnya akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div ref={scroller} className="overflow-x-auto rounded-2xl bg-card ring-1 ring-ink/10 [--lw:7.5rem] sm:[--lw:11rem]">
          <div className="relative" style={{ minWidth: `calc(var(--lw) + ${dim * COL}rem)` }}>
            {/* Latar kolom: akhir pekan dan hari ini */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[var(--lw)] right-0 grid" style={{ gridTemplateColumns: cols }}>
              {days.map((d) => (
                <div key={+d} className={`${[0, 6].includes(d.getUTCDay()) ? 'bg-ink/[0.035]' : ''} ${iso(d) === today ? 'border-x border-moss/30 bg-moss/10' : ''}`} />
              ))}
            </div>

            {/* Header tanggal */}
            <div className="relative z-10 grid grid-cols-[var(--lw)_1fr] border-b border-ink/10">
              <div className="sticky left-0 z-20 flex items-end border-r border-ink/10 bg-card px-3 pb-2 text-xs text-ink/50">Tugas</div>
              <div className="grid" style={{ gridTemplateColumns: cols }}>
                {days.map((d) => {
                  const isToday = iso(d) === today;
                  return (
                    <div key={+d} className="flex min-w-0 flex-col items-center py-1.5">
                      <span className="text-[10px] text-ink/40">{HARI[d.getUTCDay()]}</span>
                      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${isToday ? 'bg-moss font-semibold text-white' : 'text-ink/70'}`}>{d.getUTCDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Baris tugas */}
            {rows.map((t) => {
              const { s, e } = span(t);
              const done = t.status === 'done';
              const late = !done && !!t.due && t.due < today;
              return (
                <div key={t.id} className="relative z-10 grid min-h-12 grid-cols-[var(--lw)_1fr] items-center border-b border-ink/5 last:border-b-0">
                  <span
                    title={t.title}
                    className={`sticky left-0 z-20 flex h-full items-center border-r border-ink/10 bg-card px-3 text-sm ${done ? 'text-ink/40 line-through' : late ? 'text-rose-500' : ''}`}
                  >
                    <span className="truncate">{t.title}</span>
                  </span>
                  <div className="grid items-center py-2" style={{ gridTemplateColumns: cols }}>
                    <div
                      title={`${t.title}: ${fmtStr(t.start || t.due)} – ${fmtStr(t.due || t.start)}`}
                      className={`h-6 rounded-full shadow-sm ${BAR[t.priority]} ${done ? 'opacity-40' : ''} ${s < 0 ? 'rounded-l-none' : ''} ${e > dim - 1 ? 'rounded-r-none' : ''}`}
                      style={{ gridColumn: `${Math.max(s, 0) + 1} / ${Math.min(e, dim - 1) + 2}` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}