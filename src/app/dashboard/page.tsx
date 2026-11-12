import { redirect } from 'next/navigation';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function Dash() {
  const list = await db.listWorkspaces((await getUid())!);
  redirect(`/dashboard/${(list.find((w) => w.type === 'personal') || list[0]).id}`);
}
