'use client';
import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

export type Opt = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  label: string;
  className?: string; // untuk pembungkus (mis. col-span)
  compact?: boolean; // gaya chip kecil, untuk dipakai di dalam kartu
  tone?: string; // kelas warna khusus untuk tombol compact (menggantikan latar abu)
  invalid?: boolean; // tandai merah saat wajib diisi tapi masih kosong
};

const FIELD =
  'rounded-xl border border-ink/10 bg-ink/5 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink/40 hover:border-ink/20 focus:border-moss focus:ring-4 focus:ring-moss/15';

// Dropdown kustom: teks selalu terbaca di mode terang/gelap dan panahnya selalu sejajar
export default function Select({ value, onChange, options, label, className = '', compact = false, tone, invalid = false }: Props) {
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);
  const [pal, setPal] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const cur = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent | TouchEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); };
  }, [open]);

  const toggle = () => {
    if (!open) {
      // Ambil warna latar & teks halaman yang sedang aktif supaya panel ikut tema
      const clear = (c: string) => c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c);
      const bgs = [document.body, document.documentElement].map((el) => getComputedStyle(el).backgroundColor);
      setPal({ backgroundColor: bgs.find((c) => !clear(c)) ?? 'Canvas', color: getComputedStyle(document.body).color });
      setAct(Math.max(0, options.findIndex((o) => o.value === value)));
    }
    setOpen(!open);
  };
  const pick = (v: string) => { onChange(v); setOpen(false); };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return toggle();
      setAct((a) => (a + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length);
    } else if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      pick(options[act].value);
    }
  };

  const btn = compact
    ? `flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss ${tone ?? 'bg-ink/5 text-ink/80 hover:bg-ink/10'}`
    : `${FIELD} flex w-full items-center justify-between gap-2 text-left ${open ? 'border-moss ring-4 ring-moss/15' : invalid ? '!border-rose-500/60' : ''}`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={key}
        className={`${btn} whitespace-nowrap`}
      >
        <span className="truncate">{cur?.label}</span>
        <FiChevronDown className={`shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} size={compact ? 13 : 16} />
      </button>
      {open && (
        <ul
          role="listbox"
          style={pal}
          className="absolute left-0 top-full z-30 mt-1.5 max-h-60 w-max min-w-full max-w-[calc(100vw-2.5rem)] overflow-auto rounded-xl p-1 text-sm shadow-xl ring-1 ring-ink/15"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setAct(i)}
              onClick={() => pick(o.value)}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 ${i === act ? 'bg-ink/10' : ''} ${o.value === value ? 'font-medium text-moss' : ''}`}
            >
              {o.label}
              {o.value === value && <FiCheck size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}