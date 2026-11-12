'use client';
import { useEffect, useState } from 'react';
import { FiShield, FiUser, FiUserX, FiLogOut } from 'react-icons/fi';

export type M = { userId: string; name: string; email: string; role: string };

type Ask = { title: string; text: string; ok: string; run: () => Promise<boolean> };

export default function Members({ wid, me, isAdmin, ms, onGone }: { wid: string; me: string; isAdmin: boolean; ms: M[]; onGone: () => void }) {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const [ask, setAsk] = useState<Ask | null>(null);
  const base = `/api/workspaces/${wid}/members`;

  // Mengembalikan true jika berhasil
  const call = async (method: string, body: object) => {
    const r = await fetch(base, { method, body: JSON.stringify(body) });
    const d = await r.json();
    setErr(r.ok ? '' : d.error);
    if (r.ok && method === 'DELETE' && (body as { userId?: string }).userId === me) onGone();
    return r.ok;
  };

  const toggleRole = async (m: M) => {
    setBusy(m.userId);
    await call('PATCH', { userId: m.userId, role: m.role === 'admin' ? 'member' : 'admin' });
    setBusy('');
  };

  const confirm = async () => {
    if (!ask) return;
    setBusy('ask');
    await ask.run();
    setBusy('');
    setAsk(null);
  };

  useEffect(() => {
    if (!ask) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setAsk(null); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [ask]);

  const sorted = [...ms].sort((a, b) => Number(b.role === 'admin') - Number(a.role === 'admin'));
  const iconBtn = 'flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50';

  return (
    <>
      <section className="space-y-2.5 rounded-2xl border border-ink/5 bg-ink/[0.04] p-3">
        <h2 className="flex items-center gap-2 px-1 pb-1 text-sm font-medium">
          <FiUser className="text-ink/50" />
          Anggota
          <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/60">{ms.length}</span>
        </h2>

        <ul className="space-y-2">
          {sorted.map((m) => {
            const admin = m.role === 'admin';
            const self = m.userId === me;
            return (
              <li key={m.userId} className="flex items-center gap-3 rounded-xl bg-card p-2.5 text-sm ring-1 ring-ink/10">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${admin ? 'bg-moss text-white' : 'bg-moss/10 text-moss'}`} aria-hidden>
                  {m.name.trim()[0]?.toUpperCase() ?? '?'}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={m.email}>
                    {m.name}
                    {self && <span className="font-normal text-ink/50"> (kamu)</span>}
                  </p>
                  <p className={`mt-0.5 flex items-center gap-1 text-xs ${admin ? 'text-moss' : 'text-ink/50'}`}>
                    {admin ? <FiShield size={12} /> : <FiUser size={12} />}
                    {admin ? 'Admin' : 'Anggota'}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      disabled={busy === m.userId}
                      onClick={() => toggleRole(m)}
                      title={admin ? 'Jadikan anggota' : 'Jadikan admin'}
                      aria-label={admin ? `Jadikan ${m.name} anggota` : `Jadikan ${m.name} admin`}
                      className={`${iconBtn} bg-ink/5 text-ink/70 hover:bg-ink/10 hover:text-ink`}
                    >
                      {admin ? <FiUser size={15} /> : <FiShield size={15} />}
                      <span className="md:hidden">{admin ? 'Jadikan anggota' : 'Jadikan admin'}</span>
                    </button>
                    {!self && (
                      <button
                        aria-label={`Keluarkan ${m.name}`}
                        title="Keluarkan"
                        onClick={() => setAsk({
                          title: `Keluarkan ${m.name}?`,
                          text: 'Anggota ini tidak akan bisa lagi melihat papan tim, kecuali bergabung kembali.',
                          ok: 'Keluarkan',
                          run: () => call('DELETE', { userId: m.userId }),
                        })}
                        className={`${iconBtn} w-9 px-0 text-rose-500 hover:bg-rose-500/10`}
                      >
                        <FiUserX size={16} />
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {err && <p role="alert" className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">{err}</p>}

        <button
          onClick={() => setAsk({
            title: 'Keluar dari tim ini?',
            text: 'Kamu tidak akan bisa melihat tugas tim ini lagi, kecuali diundang kembali.',
            ok: 'Keluar',
            run: () => call('DELETE', { userId: me }),
          })}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink/60 transition hover:bg-rose-500/10 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
        >
          <FiLogOut size={15} />Keluar dari tim
        </button>
      </section>

      {ask && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-4 backdrop-blur-sm sm:place-items-center"
          onMouseDown={(e) => { if (e.target === e.currentTarget && busy !== 'ask') setAsk(null); }}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="ask-title" className="w-full max-w-sm space-y-4 rounded-3xl border border-ink/10 bg-card p-6 shadow-2xl">
            <div className="space-y-1.5">
              <h2 id="ask-title" className="font-display text-xl font-semibold tracking-tight">{ask.title}</h2>
              <p className="text-sm text-ink/60">{ask.text}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button autoFocus type="button" disabled={busy === 'ask'} onClick={() => setAsk(null)} className="rounded-xl px-4 py-2.5 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink">Batal</button>
              <button
                type="button"
                disabled={busy === 'ask'}
                onClick={confirm}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-rose-500/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/30 disabled:opacity-60"
              >
                {busy === 'ask' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                {ask.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}