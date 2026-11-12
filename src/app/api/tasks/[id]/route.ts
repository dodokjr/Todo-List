import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { emit } from '@/lib/bus';
import { logEv } from '@/lib/log';
const LBL: Record<string, string> = { todo: 'Akan dikerjakan', doing: 'Sedang berjalan', done: 'Selesai' };
function nextDue(d: string, r: string) {
  const x = new Date((d || new Date().toISOString().slice(0, 10)) + 'T00:00:00Z');
  if (r === 'daily') x.setUTCDate(x.getUTCDate() + 1); else if (r === 'weekly') x.setUTCDate(x.getUTCDate() + 7); else x.setUTCMonth(x.getUTCMonth() + 1);
  return x.toISOString().slice(0, 10);
}
async function guard(id: string) { const u = await getUid(); const t = u ? await db.taskById(id) : null; return t && (await db.isMember(t.workspaceId, u!)) ? { t, u: u! } : null; }
// Semua anggota tim boleh mengubah / menghapus task apa pun
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id); if (!g) return NextResponse.json({ error: 'Dilarang' }, { status: 403 });
  const { t, u } = g; const b = await req.json(); const p: any = {}; const acts: string[] = [];
  for (const k of ['title', 'status', 'priority', 'due', 'assignee', 'start', 'checklist', 'repeat']) if (k in b) p[k] = String(b[k]);
  if ('due' in p) p.reminded = '';
  if (p.status && p.status !== t.status) acts.push(`memindahkan ke "${LBL[p.status] || p.status}"`);
  if ('assignee' in p && p.assignee !== t.assignee) acts.push('mengubah penanggung jawab');
  if ('due' in p && p.due !== t.due) acts.push(`mengubah tenggat menjadi ${p.due || 'kosong'}`);
  if (p.status === 'done' && t.status !== 'done' && t.repeat) { // tugas berulang: buat salinan berikutnya
    const due = nextDue(t.due, t.repeat);
    const items = (() => { try { return JSON.parse(t.checklist || '[]').map((x: any) => ({ ...x, d: false })); } catch { return []; } })();
    await db.createTask({ ...t, id: nanoid(), status: 'todo', due, start: '', checklist: JSON.stringify(items), timeSec: '0', timerStart: '', reminded: '', createdAt: new Date().toISOString() });
    p.repeat = ''; acts.push(`membuat tugas berulang berikutnya (${due})`);
  }
  await db.updateTask(params.id, p);
  for (const a of acts) await logEv(t.workspaceId, t.id, u, 'activity', a);
  emit(t.workspaceId, 'tasks'); return NextResponse.json({ ok: 1 });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id); if (!g) return NextResponse.json({ error: 'Dilarang' }, { status: 403 });
  await db.deleteTask(params.id); emit(g.t.workspaceId, 'tasks'); return NextResponse.json({ ok: 1 });
}
