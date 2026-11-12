import { NextResponse } from 'next/server';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { emit } from '@/lib/bus';
const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });
type P = { params: { id: string } };
export async function GET(_: Request, { params }: P) {
  const u = await getUid(); if (!u || !(await db.isMember(params.id, u))) return err('Dilarang', 403);
  const ms = await db.listMembers(params.id);
  const out = await Promise.all(ms.map(async (m) => { const x = await db.userById(m.userId); return { userId: m.userId, name: x?.name || '?', email: x?.email || '', role: m.role }; }));
  return NextResponse.json(out);
}
// Admin: ubah role anggota
export async function PATCH(req: Request, { params }: P) {
  const u = await getUid(); if (!u || (await db.memberRole(params.id, u)) !== 'admin') return err('Hanya admin yang boleh mengubah role', 403);
  const b = await req.json(); if (!['admin', 'member'].includes(b.role)) return err('Role tidak valid');
  const ms = await db.listMembers(params.id); const target = ms.find((m) => m.userId === b.userId);
  if (!target) return err('Anggota tidak ditemukan', 404);
  if (target.role === 'admin' && b.role === 'member' && ms.filter((m) => m.role === 'admin').length < 2) return err('Harus ada minimal satu admin');
  await db.setRole(params.id, b.userId, b.role); emit(params.id, 'members'); return NextResponse.json({ ok: 1 });
}
// Admin: keluarkan anggota. Anggota biasa: hanya boleh keluar sendiri.
export async function DELETE(req: Request, { params }: P) {
  const u = await getUid(); const myRole = u ? await db.memberRole(params.id, u) : null; if (!u || !myRole) return err('Dilarang', 403);
  const b = await req.json().catch(() => ({})); const target = b.userId || u;
  if (target !== u && myRole !== 'admin') return err('Hanya admin yang boleh mengeluarkan anggota', 403);
  const ms = await db.listMembers(params.id); const t = ms.find((m) => m.userId === target); if (!t) return err('Anggota tidak ditemukan', 404);
  if (t.role === 'admin' && ms.filter((m) => m.role === 'admin').length < 2) return err('Jadikan anggota lain sebagai admin dulu');
  await db.removeMember(params.id, target); emit(params.id, 'members'); return NextResponse.json({ ok: 1 });
}
