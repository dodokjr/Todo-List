import { notFound } from 'next/navigation';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import Board from '@/components/Board';
export const dynamic = 'force-dynamic';
export default async function Page({ params }: { params: { id: string } }) {
  const uid = (await getUid())!; const role = await db.memberRole(params.id, uid);
  if (!role) notFound();
  const ws = (await db.listWorkspaces(uid)).find((w) => w.id === params.id)!;
  return <Board key={ws.id} me={uid} isAdmin={role === 'admin'} ws={{ id: ws.id, name: ws.name, type: ws.type, code: ws.code }} init={await db.listTasks(ws.id)} />;
}
