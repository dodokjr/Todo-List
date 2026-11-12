import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/mail';
export const dynamic = 'force-dynamic';
// Kirim email pengingat untuk tugas yang jatuh tempo hari ini, besok, atau sudah lewat. Satu kali per tenggat.
export async function GET(req: Request) {
  const sec = process.env.CRON_SECRET;
  if (!sec || req.headers.get('authorization') !== `Bearer ${sec}`) return NextResponse.json({ error: 'Dilarang' }, { status: 401 });
  const today = new Date().toISOString().slice(0, 10); const up = new Date(Date.now() + 86400000).toISOString().slice(0, 10); let sent = 0;
  for (const t of await db.dueTasks(up)) {
    const u = await db.userById(t.assignee || t.createdBy); if (!u) continue;
    const when = t.due < today ? 'sudah lewat' : t.due === today ? 'hari ini' : 'besok';
    await sendMail(u.email, `Pengingat: ${t.title}`, `Halo ${u.name}, tugas "${t.title}" jatuh tempo ${when} (${t.due}). Buka: ${process.env.APP_URL || 'http://localhost:3000'}/dashboard/${t.workspaceId}`);
    await db.updateTask(t.id, { reminded: '1' }); sent++;
  }
  return NextResponse.json({ sent });
}
