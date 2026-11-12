import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { nanoid, customAlphabet } from 'nanoid';
const tok = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
import { db } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { mkWs } from '@/lib/ws';
import { sendReset } from '@/lib/mail';
import { limited } from '@/lib/limit';
const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });
export async function POST(req: Request, { params }: { params: { action: string } }) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase(); const pw = String(b.password || '');
  const ip = req.headers.get('x-forwarded-for') || 'x';
  if (['login', 'forgot', 'reset'].includes(params.action) && limited(`${params.action}:${email || ip}:${ip}`)) return err('Terlalu banyak percobaan, coba lagi 15 menit lagi', 429);
  switch (params.action) {
    case 'logout': cookies().delete('s'); return NextResponse.json({ ok: 1 });
    case 'register': {
      if (!b.name?.trim() || !email.includes('@') || pw.length < 6) return err('Isi nama, email valid, dan password minimal 6 karakter');
      if (await db.userByEmail(email)) return err('Email sudah terdaftar');
      const id = nanoid(); await db.createUser({ id, name: b.name.trim(), email, passwordHash: await bcrypt.hash(pw, 10) });
      await mkWs(id, 'Folder Pribadi', 'personal'); await setSession(id); return NextResponse.json({ ok: 1 });
    }
    case 'login': {
      const u = await db.userByEmail(email);
      if (!u || !(await bcrypt.compare(pw, u.passwordHash))) return err('Email atau password salah', 401);
      await setSession(u.id); return NextResponse.json({ ok: 1 });
    }
    case 'forgot': {
      const u = await db.userByEmail(email); let dev: string | undefined;
      if (u) {
        const token = tok(); await db.updateUser(u.id, { resetToken: token, resetExp: Date.now() + 900000 });
        const link = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
        if (!(await sendReset(email, link, token)) && process.env.NODE_ENV !== 'production') dev = token;
      }
      return NextResponse.json({ ok: 1, dev });
    }
    case 'reset': {
      const t = String(b.token || '').trim().toUpperCase(); const u = await db.userByEmail(email);
      if (!u || !t || u.resetToken !== t || Number(u.resetExp) < Date.now()) return err('Token salah atau sudah kedaluwarsa (berlaku 15 menit)');
      if (pw.length < 6) return err('Password minimal 6 karakter');
      await db.updateUser(u.id, { passwordHash: await bcrypt.hash(pw, 10), resetToken: '', resetExp: 0 }); return NextResponse.json({ ok: 1 });
    }
  }
  return err('Tidak ditemukan', 404);
}
