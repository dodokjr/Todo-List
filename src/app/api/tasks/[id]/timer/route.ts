import { NextResponse } from 'next/server';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { emit } from '@/lib/bus';
import { logEv } from '@/lib/log';
// Timer dihitung di server; saat stop, durasi dicatat sebagai entri waktu untuk laporan
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUid(); const t = u ? await db.taskById(params.id) : null;
  if (!t || !(await db.isMember(t.workspaceId, u!))) return NextResponse.json({ error: 'Dilarang' }, { status: 403 });
  const { action } = await req.json();
  if (action === 'start' && !t.timerStart) { await db.updateTask(t.id, { timerStart: String(Date.now()) }); await logEv(t.workspaceId, t.id, u!, 'activity', 'memulai timer'); }
  if (action === 'stop' && t.timerStart) {
    const add = Math.round((Date.now() - Number(t.timerStart)) / 1000);
    await db.updateTask(t.id, { timeSec: String(Number(t.timeSec || 0) + add), timerStart: '' });
    await logEv(t.workspaceId, t.id, u!, 'time', '', String(add));
  }
  emit(t.workspaceId, 'tasks'); return NextResponse.json({ ok: 1 });
}
