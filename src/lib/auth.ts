import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const key = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
export async function setSession(uid: string) {
  const t = await new SignJWT({ uid }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key());
  cookies().set('s', t, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 604800, secure: process.env.NODE_ENV === 'production' });
}
export async function getUid(): Promise<string | null> {
  try { const t = cookies().get('s')?.value; return t ? ((await jwtVerify(t, key())).payload.uid as string) : null; } catch { return null; }
}
