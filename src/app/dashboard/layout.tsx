import { redirect } from 'next/navigation';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import Sidebar from '@/components/Sidebar';
export const dynamic = 'force-dynamic';
export default async function Layout({ children }: { children: React.ReactNode }) {
  const uid = await getUid(); if (!uid) redirect('/login');
  const [user, list] = await Promise.all([db.userById(uid), db.listWorkspaces(uid)]);
  if (!user) redirect('/login');
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar name={user.name} list={list.map(({ id, name, type }) => ({ id, name, type }))} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
