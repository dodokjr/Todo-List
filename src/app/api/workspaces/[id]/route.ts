import { NextResponse } from 'next/server';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { emit } from '@/lib/bus';
const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });
async function admin(id: string) { const u = await getUid(); return u && (await db.memberRole(id, u)) === 'admin' ? u : null; }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await admin(params.id))) return err('Hanya admin', 403);
  const b = await req.json(); if (!b.name?.trim()) return err('Nama wajib diisi');
  await db.updateWorkspace(params.id, { name: b.name.trim() }); emit(params.id, 'ws'); return NextResponse.json({ ok: 1 });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await admin(params.id))) return err('Hanya admin', 403);
  const w = (await db.listWorkspaces((await getUid())!)).find((x) => x.id === params.id);
  if (!w || w.type !== 'team') return err('Folder pribadi tidak bisa dihapus');
  await db.deleteWorkspace(params.id); emit(params.id, 'ws'); return NextResponse.json({ ok: 1 });
}
