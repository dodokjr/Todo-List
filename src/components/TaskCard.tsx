'use client';
import { useState } from 'react';
import { FiTrash2, FiPlay, FiSquare, FiClock, FiCheck, FiX, FiRepeat, FiMessageSquare, FiPlus, FiSend, FiUser } from 'react-icons/fi';
import { COLS, PR, BAR, type T } from './t';
import type { M } from './Members';
import type { Ev } from '@/lib/types';
import Select from './Select';

type Item = { i: string; t: string; d: boolean };
const fmt = (s: number) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const rnd = () => Math.random().toString(36).slice(2, 8);
const tplItems = (x: Ev): string[] => { try { return JSON.parse(x.data); } catch { return []; } };
const when = (e: Ev) => e.createdAt.slice(5, 16).replace('T', ' ');

const PRIOS = [{ value: 'low', label: 'Rendah' }, { value: 'med', label: 'Sedang' }, { value: 'high', label: 'Tinggi' }];
const REPEATS = [{ value: '', label: 'Tidak berulang' }, { value: 'daily', label: 'Harian' }, { value: 'weekly', label: 'Mingguan' }, { value: 'monthly', label: 'Bulanan' }];

type P = { t: T; team: boolean; ms: M[]; today: string; now: number; evs: Ev[]; tpls: Ev[]; me: string; nameOf: (u: string) => string;
  patch: (id: string, p: Partial<T>) => void; del: (id: string) => void; timer: (id: string, a: 'start' | 'stop') => void;
  comment: (id: string, text: string) => void; saveTpl: (name: string, items: string[]) => void; delEv: (id: string) => void };

export default function TaskCard({ t, team, ms, today, now, evs, tpls, me, nameOf, patch, del, timer, comment, saveTpl, delEv }: P) {
  const items: Item[] = (() => { try { return JSON.parse(t.checklist || '[]'); } catch { return []; } })();
  const [txt, setTxt] = useState('');
  const [open, setOpen] = useState(false);
  const [cm, setCm] = useState('');
  const [naming, setNaming] = useState(false);
  const [tplName, setTplName] = useState('');

  const save = (n: Item[]) => patch(t.id, { checklist: JSON.stringify(n) });
  const addItem = () => { if (!txt.trim()) return; save([...items, { i: rnd(), t: txt.trim(), d: false }]); setTxt(''); };
  const sendComment = () => { if (!cm.trim()) return; comment(t.id, cm); setCm(''); };
  const saveTemplate = () => { const n = tplName.trim(); if (!n) return; saveTpl(n, items.map((x) => x.t)); setTplName(''); setNaming(false); };

  const run = !!t.timerStart;
  const secs = Number(t.timeSec || 0) + (run ? (now - Number(t.timerStart)) / 1000 : 0);
  const late = !!t.due && t.status !== 'done' && t.due < today;
  const done = items.filter((x) => x.d).length;
  const comments = evs.filter((e) => e.type === 'comment').length;

  const dateCls = 'w-full min-w-0 rounded-lg border border-ink/10 bg-ink/5 px-2 py-1.5 text-xs outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20';
  const plain = 'w-full rounded-lg border border-ink/10 bg-ink/[0.03] px-3 py-2 text-sm outline-none transition placeholder:text-ink/40 focus:border-moss focus:ring-2 focus:ring-moss/20';

  return (
    <article className={`space-y-3.5 rounded-2xl bg-card p-3.5 shadow-sm ring-1 transition hover:shadow-md sm:p-4 ${late ? 'ring-rose-500/40' : 'ring-ink/10'}`}>
      {/* Judul + hapus */}
      <header className="flex items-start gap-2">
        <span className={`mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full ${BAR[t.priority]}`} aria-hidden />
        <input
          key={t.title}
          aria-label="Judul tugas"
          className={`-mx-1 min-w-0 flex-1 rounded-lg bg-transparent px-1.5 py-1.5 text-base font-medium leading-snug outline-none transition focus:bg-ink/5 sm:text-[15px] ${t.status === 'done' ? 'text-ink/50 line-through' : ''}`}
          defaultValue={t.title}
          onBlur={(e) => e.target.value.trim() && e.target.value !== t.title && patch(t.id, { title: e.target.value })}
        />
        <button onClick={() => del(t.id)} aria-label="Hapus tugas" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink/40 transition hover:bg-rose-500/10 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss">
          <FiTrash2 size={16} />
        </button>
      </header>

      {/* Prioritas, status, penanggung jawab */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Select compact label="Prioritas" value={t.priority} onChange={(v) => patch(t.id, { priority: v })} options={PRIOS} tone={PR[t.priority]} />
        <Select compact label="Status" value={t.status} onChange={(v) => patch(t.id, { status: v })} options={COLS.map(([s, l]) => ({ value: s, label: l }))} />
        {team && (
          <Select
            compact
            label="Penanggung jawab"
            value={t.assignee || ''}
            onChange={(v) => patch(t.id, { assignee: v })}
            options={[{ value: '', label: 'Belum ditugaskan' }, ...ms.map((m) => ({ value: m.userId, label: m.name }))]}
          />
        )}
      </div>

      {/* Tanggal + pengulangan */}
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[11px] text-ink/50">Mulai</span>
          <input type="date" className={dateCls} value={t.start} onChange={(e) => patch(t.id, { start: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className={`flex items-center justify-between text-[11px] ${late ? 'text-rose-500' : 'text-ink/50'}`}>
            Tenggat{late && <b className="font-medium">Terlambat</b>}
          </span>
          <input type="date" className={`${dateCls} ${late ? 'border-rose-500/60 text-rose-500' : ''}`} value={t.due} onChange={(e) => patch(t.id, { due: e.target.value })} />
        </label>
        <div className="col-span-2 flex items-center gap-2 text-ink/50">
          <FiRepeat size={14} aria-hidden />
          <Select compact label="Pengulangan" value={t.repeat || ''} onChange={(v) => patch(t.id, { repeat: v })} options={REPEATS} />
        </div>
      </div>

      {/* Timer + komentar */}
      <div className="flex items-center gap-3 rounded-xl bg-ink/[0.04] p-2">
        <button
          onClick={() => timer(t.id, run ? 'stop' : 'start')}
          aria-label={run ? 'Hentikan timer' : 'Mulai timer'}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 ${run ? 'bg-rose-500 shadow-rose-500/30 focus-visible:ring-rose-500/30' : 'bg-moss shadow-moss/30 focus-visible:ring-moss/30'}`}
        >
          {run ? <FiSquare size={13} /> : <FiPlay size={13} className="translate-x-px" />}
        </button>
        <span className={`flex items-center gap-1.5 font-mono text-base tabular-nums ${run ? 'text-moss' : 'text-ink/70'}`}>
          <FiClock size={14} />{fmt(secs)}
          {run && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-moss" aria-hidden />}
        </span>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Komentar dan aktivitas"
          className={`ml-auto flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs transition ${open ? 'bg-moss/10 text-moss' : 'text-ink/60 hover:bg-ink/5'}`}
        >
          <FiMessageSquare size={14} />{comments}
        </button>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {items.length > 0 && (
          <div className="space-y-1.5 pb-1">
            <p className="flex items-center justify-between text-xs text-ink/60"><span>Checklist</span><span>{done}/{items.length}</span></p>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
            </div>
          </div>
        )}
        {items.map((x) => (
          <div key={x.i} className="group flex items-center gap-2.5 rounded-lg py-1 text-sm">
            <button
              role="checkbox"
              aria-checked={x.d}
              aria-label="Centang"
              onClick={() => save(items.map((y) => (y.i === x.i ? { ...y, d: !y.d } : y)))}
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss ${x.d ? 'border-moss bg-moss text-white' : 'border-ink/30 hover:border-moss'}`}
            >
              {x.d && <FiCheck size={13} strokeWidth={3} />}
            </button>
            <span className={`min-w-0 flex-1 break-words ${x.d ? 'text-ink/40 line-through' : ''}`}>{x.t}</span>
            <button aria-label="Hapus item" className="grid h-7 w-7 place-items-center rounded-lg text-ink/30 transition hover:bg-ink/5 hover:text-ink/70 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100" onClick={() => save(items.filter((y) => y.i !== x.i))}>
              <FiX size={14} />
            </button>
          </div>
        ))}
        <div className="relative">
          <FiPlus className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={15} />
          <input
            className={`${plain} border-dashed pl-9`}
            placeholder="Tambah item checklist"
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
            enterKeyHint="done"
          />
        </div>

        <details className="group/tpl text-xs text-ink/70">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-lg px-1 py-1.5 text-ink/60 transition hover:text-ink [&::-webkit-details-marker]:hidden">
            Template checklist
          </summary>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tpls.map((x) => (
              <span key={x.id} className="flex items-center rounded-full bg-moss/10 text-moss">
                <button className="py-1 pl-2.5 pr-1.5" onClick={() => save([...items, ...tplItems(x).map((n) => ({ i: rnd(), t: n, d: false }))])}>+ {x.text}</button>
                <button aria-label="Hapus template" className="py-1 pr-2.5 opacity-70 hover:opacity-100" onClick={() => delEv(x.id)}><FiX size={12} /></button>
              </span>
            ))}
            {items.length > 0 && !naming && (
              <button className="rounded-full px-2.5 py-1 ring-1 ring-ink/20 transition hover:bg-ink/5" onClick={() => setNaming(true)}>Simpan sebagai template</button>
            )}
            {!tpls.length && !items.length && <span className="text-ink/50">Isi checklist lalu simpan sebagai template.</span>}
          </div>
          {naming && (
            <div className="mt-2 flex gap-1.5">
              <input
                autoFocus
                className={`${plain} py-1.5`}
                placeholder="Nama template"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTemplate(); if (e.key === 'Escape') setNaming(false); }}
              />
              <button onClick={saveTemplate} disabled={!tplName.trim()} className="rounded-lg bg-moss px-3 text-xs font-medium text-white disabled:opacity-50">Simpan</button>
              <button onClick={() => setNaming(false)} className="rounded-lg px-2 text-ink/60 hover:bg-ink/5">Batal</button>
            </div>
          )}
        </details>
      </div>

      {/* Komentar & aktivitas */}
      {open && (
        <div className="space-y-2.5 border-t border-ink/10 pt-3 text-xs">
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-0.5">
            {evs.length === 0 && <p className="py-2 text-center text-ink/50">Belum ada aktivitas.</p>}
            {evs.map((e) => e.type === 'comment' ? (
              <div key={e.id} className={`flex gap-2 ${e.userId === me ? 'flex-row-reverse' : ''}`}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-moss/10 text-[11px] font-semibold text-moss" aria-hidden>
                  {nameOf(e.userId).trim()[0]?.toUpperCase() ?? <FiUser size={12} />}
                </span>
                <div className={`min-w-0 max-w-[85%] rounded-2xl px-3 py-2 text-sm ${e.userId === me ? 'rounded-tr-md bg-moss/10' : 'rounded-tl-md bg-ink/5'}`}>
                  <p className="flex items-center gap-2 text-[11px] text-ink/50">
                    <b className="font-medium text-ink/70">{nameOf(e.userId)}</b>{when(e)}
                    {e.userId === me && <button aria-label="Hapus komentar" className="ml-auto text-ink/40 hover:text-rose-500" onClick={() => delEv(e.id)}><FiX size={12} /></button>}
                  </p>
                  <p className="mt-0.5 break-words">{e.text}</p>
                </div>
              </div>
            ) : (
              <p key={e.id} className="px-1 text-center text-[11px] text-ink/50"><b className="font-medium">{nameOf(e.userId)}</b> {e.text} <span className="text-ink/35">{when(e)}</span></p>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              className={`${plain} rounded-full px-4 text-base sm:text-sm`}
              placeholder="Tulis komentar"
              value={cm}
              onChange={(e) => setCm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendComment(); }}
              enterKeyHint="send"
            />
            <button onClick={sendComment} disabled={!cm.trim()} aria-label="Kirim komentar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-moss text-white shadow shadow-moss/30 transition active:scale-95 disabled:opacity-40">
              <FiSend size={15} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}