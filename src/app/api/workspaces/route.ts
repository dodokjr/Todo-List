import { NextResponse } from 'next/server';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { mkWs } from '@/lib/ws';
import { emit } from '@/lib/bus';
const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });
// Buat tim baru ({name}) atau gabung tim lewat ID ({code})
export async function POST(req: Request) {
  const u = await getUid(); if (!u) return err('Belum login', 401);
  const b = await req.json().catch(() => ({}));
  if (b.code) {
    const w = await db.workspaceByCode(String(b.code).trim().toUpperCase());
    if (!w || w.type !== 'team') return err('ID tim tidak ditemukan');
    if (!(await db.isMember(w.id, u))) { await db.addMember({ workspaceId: w.id, userId: u, role: 'member' }); emit(w.id, 'members'); }
    return NextResponse.json(w);
  }
  if (!b.name?.trim()) return err('Nama tim wajib diisi');
  return NextResponse.json(await mkWs(u, b.name.trim(), 'team'));
}
