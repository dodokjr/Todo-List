import { NextResponse } from 'next/server';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { logEv } from '@/lib/log';
import { emit } from '@/lib/bus';
const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });
type P = { params: { id: string } };
async function who(id: string) { const u = await getUid(); return u && (await db.isMember(id, u)) ? u : null; }
export async function GET(_: Request, { params }: P) { if (!(await who(params.id))) return err('Dilarang', 403); return NextResponse.json(await db.listEvents(params.id)); }
// Tambah komentar ({taskId,text}) atau template checklist ({kind:'template',text,data})
export async function POST(req: Request, { params }: P) {
  const u = await who(params.id); if (!u) return err('Dilarang', 403);
  const b = await req.json(); const text = String(b.text || '').trim().slice(0, 1000); if (!text) return err('Teks wajib diisi');
  if (b.kind === 'template') await logEv(params.id, '', u, 'template', text.slice(0, 60), String(b.data || '[]').slice(0, 20000));
  else { const t = await db.taskById(String(b.taskId)); if (!t || t.workspaceId !== params.id) return err('Tugas tidak ditemukan', 404); await logEv(params.id, t.id, u, 'comment', text); }
  return NextResponse.json({ ok: 1 });
}
// Hapus template, atau komentar milik sendiri
export async function DELETE(req: Request, { params }: P) {
  const u = await who(params.id); if (!u) return err('Dilarang', 403);
  const { id } = await req.json(); const e = (await db.listEvents(params.id)).find((x) => x.id === id);
  if (!e || !(e.type === 'template' || (e.type === 'comment' && e.userId === u))) return err('Tidak bisa dihapus', 403);
  await db.deleteEvent(id); emit(params.id, 'log'); return NextResponse.json({ ok: 1 });
}
