import Link from 'next/link';
import { FiColumns, FiUsers, FiZap, FiClock, FiCheckSquare, FiMoon, FiArrowRight, FiCheck } from 'react-icons/fi';
import { getUid } from '@/lib/auth';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

const FEATURES = [
  [FiColumns, 'Papan, Timeline, Kalender', 'Lihat pekerjaan dari tiga sudut: kolom status, bar jadwal, dan kalender bulanan.'],
  [FiUsers, 'Tim dengan role', 'Undang rekan lewat ID tim. Admin mengatur anggota, semua anggota bisa mengubah tugas.'],
  [FiZap, 'Real-time', 'Perubahan teman satu tim langsung muncul tanpa perlu refresh.'],
  [FiClock, 'Timer waktu', 'Catat durasi kerja per tugas. Hitungannya sama untuk seluruh tim.'],
  [FiCheckSquare, 'Checklist', 'Pecah tugas besar menjadi langkah kecil dan pantau progresnya.'],
  [FiMoon, 'Mode gelap', 'Nyaman di mata, siang maupun malam.'],
] as const;
// Susunan bento: lebar kartu di layar besar (baris 1: 2+1, baris 2: 1+2, baris 3: 1+2)
const SPAN = ['lg:col-span-2', '', '', 'lg:col-span-2', '', 'lg:col-span-2'];

const STEPS = [
  ['Buat akun', 'Folder pribadimu langsung siap dipakai.'],
  ['Buat atau gabung tim', 'Bagikan ID tim ke rekan, mereka masuk dengan satu kolom.'],
  ['Kerjakan bersama', 'Atur tugas, penanggung jawab, dan tenggat dalam satu tempat.'],
];

const COLS = [
  ['Akan dikerjakan', [['Susun brief proyek', 'bg-amber-500', 'Sari'], ['Riset kompetitor', 'bg-emerald-500', 'Budi']]],
  ['Sedang berjalan', [['Desain halaman utama', 'bg-rose-500', 'Dewi'], ['Review kode', 'bg-amber-500', 'Andi']]],
  ['Selesai', [['Setup repo', 'bg-emerald-500', 'Andi'], ['Kickoff tim', 'bg-emerald-500', 'Sari']]],
] as const;

const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-moss px-5 py-3 font-medium text-white shadow-lg shadow-moss/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-moss/30 active:scale-[0.98]';
const ghost = 'rounded-xl px-3.5 py-2 text-sm transition hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss';

function Preview() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 -z-10 rounded-full bg-moss/20 blur-3xl" />

      <div className="rounded-3xl bg-card p-3 shadow-2xl ring-1 ring-ink/10 sm:p-4 lg:rotate-1 lg:transition lg:duration-300 lg:hover:rotate-0">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 truncate rounded-full bg-ink/5 px-3 py-0.5 text-xs text-ink/60">Tim Produk</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-moss"><span className="h-1.5 w-1.5 rounded-full bg-moss" />Live</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {COLS.map(([t, cs], i) => (
            <div key={t} className="space-y-1.5 rounded-xl bg-ink/5 p-1.5 sm:space-y-2 sm:p-2">
              <p className="truncate px-0.5 text-[10px] font-medium sm:text-[11px]">{t}</p>
              {cs.map(([n, c, who]) => (
                <div key={n} className="space-y-2 rounded-lg bg-card p-1.5 ring-1 ring-ink/10 sm:p-2">
                  <p className={`text-[11px] font-medium leading-tight sm:text-xs ${i === 2 ? 'line-through opacity-50' : ''}`}>{n}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-5 rounded-full sm:w-6 ${c}`} />
                    <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-moss/20 text-[9px] font-bold text-moss">{who[0]}</span>
                  </div>
                  {i === 1 && <div className="flex items-center gap-1 font-mono text-[10px] text-moss"><FiClock size={10} />0:42:10</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Kartu melayang */}
      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2.5 rounded-2xl bg-card px-3.5 py-2.5 text-xs shadow-xl ring-1 ring-ink/10 sm:flex">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-moss text-white"><FiClock size={15} /></span>
        <span><b className="block font-mono text-sm">0:42:10</b><span className="text-ink/60">Timer berjalan</span></span>
      </div>
      <div className="absolute -right-3 -top-5 hidden items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 text-xs shadow-xl ring-1 ring-ink/10 sm:flex">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-moss/15 text-moss"><FiCheck size={14} strokeWidth={3} /></span>
        <span><b className="font-medium">Andi</b> menyelesaikan <span className="text-ink/60">Setup repo</span></span>
      </div>
    </div>
  );
}

export default async function Landing() {
  const uid = await getUid();
  const cta = uid ? '/dashboard' : '/register';
  const year = new Date().getFullYear();

  return (
    <div className="overflow-x-hidden">
      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="mx-auto flex max-w-6xl items-center gap-2 rounded-2xl border border-ink/10 bg-paper/70 px-3 py-2 shadow-sm backdrop-blur-md">
          <Logo />
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <a href="#fitur" className={`hidden sm:block ${ghost}`}>Fitur</a>
            <a href="#cara" className={`hidden sm:block ${ghost}`}>Cara kerja</a>
            <ThemeToggle />
            {!uid && <Link href="/login" className={ghost}>Masuk</Link>}
            <Link href={cta} className="rounded-xl bg-moss px-4 py-2 font-medium text-white shadow-md shadow-moss/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-moss/30">
              {uid ? 'Buka dashboard' : 'Daftar'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pb-24 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[32rem] text-ink/15"
          style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px', maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }}
        />
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-moss/10 px-3.5 py-1.5 text-sm text-moss ring-1 ring-moss/20">
            <FiZap size={14} />Untuk sendiri maupun tim
          </span>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl xl:text-7xl">
            Semua tugas, <span className="block text-moss">di satu tempat yang tenang.</span>
          </h1>
          <p className="max-w-lg text-lg text-ink/70">
            Atur pekerjaan lewat papan, timeline, dan kalender. Catat waktu, centang checklist, dan kerja bareng tim secara real-time.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={cta} className={`${primary} px-6`}>{uid ? 'Buka dashboard' : 'Mulai sekarang'}<FiArrowRight /></Link>
            {!uid && <Link href="/login" className="rounded-xl px-6 py-3 ring-1 ring-ink/20 transition hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss">Sudah punya akun</Link>}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink/60">
            {['Real-time', 'Mode gelap', 'Undang tim dengan ID'].map((x) => (
              <li key={x} className="flex items-center gap-1.5"><FiCheck className="text-moss" />{x}</li>
            ))}
          </ul>
        </div>
        <Preview />
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
        <div className="mb-10 max-w-xl space-y-3">
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Semua yang dibutuhkan, tanpa ribet.</h2>
          <p className="text-ink/70">Enam alat inti untuk menjaga pekerjaan tetap rapi, sendiri atau bersama tim.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([Ic, t, d], i) => (
            <div key={t} className={`group rounded-3xl bg-card p-6 ring-1 ring-ink/10 transition hover:ring-moss/40 lg:p-7 ${SPAN[i]}`}>
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-moss/10 text-moss transition group-hover:bg-moss group-hover:text-white"><Ic size={22} /></span>
              <h3 className="mb-1.5 text-lg font-semibold">{t}</h3>
              <p className="max-w-md text-sm leading-relaxed text-ink/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section id="cara" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
        <div className="mb-12 max-w-xl space-y-3">
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Tiga langkah, langsung jalan.</h2>
        </div>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative flex gap-4 md:block">
              <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-moss font-display text-lg font-semibold text-white shadow-lg shadow-moss/25">{i + 1}</span>
              {i < STEPS.length - 1 && <span aria-hidden className="absolute left-14 right-2 top-[1.375rem] hidden h-px bg-ink/15 md:block" />}
              <div className="md:mt-5">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-moss p-10 text-center text-white md:p-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          />
          <h2 className="relative font-display text-4xl font-semibold tracking-tight md:text-5xl">Siap merapikan hari-harimu?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/80">Buat akun, dan folder pribadimu langsung siap.</p>
          <Link href={cta} className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-moss shadow-xl shadow-black/10 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
            {uid ? 'Buka dashboard' : 'Daftar sekarang'}<FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Logo />
            <p className="text-sm text-ink/60">Daftar tugas untuk pribadi dan tim.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/70">
            <a href="#fitur" className="transition hover:text-ink">Fitur</a>
            <a href="#cara" className="transition hover:text-ink">Cara kerja</a>
            <Link href={uid ? '/dashboard' : '/login'} className="transition hover:text-ink">{uid ? 'Dashboard' : 'Masuk'}</Link>
          </nav>
        </div>
        <div className="border-t border-ink/10 px-4 py-5 text-center text-sm text-ink/60">
          Copyright © {year}{' '}
          <a href="https://mfikria.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium text-moss underline-offset-4 hover:underline">mfikria</a>.
          {' '}Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
}