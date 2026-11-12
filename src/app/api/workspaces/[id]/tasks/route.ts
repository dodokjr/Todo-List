import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { emit } from '@/lib/bus';
import { logEv } from '@/lib/log';
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const u = await getUid(); if (!u || !(await db.isMember(params.id, u))) return NextResponse.json({ error: 'Dilarang' }, { status: 403 });
  return NextResponse.json(await db.listTasks(params.id));
}
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUid(); if (!u || !(await db.isMember(params.id, u))) return NextResponse.json({ error: 'Dilarang' }, { status: 403 });
  const b = await req.json();
  if (!b.title?.trim()) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 });
  const id = nanoid();
  await db.createTask({ id, workspaceId: params.id, title: b.title.trim(), status: 'todo', priority: b.priority || 'med', due: b.due || '', assignee: b.assignee || '', start: '', checklist: '', timeSec: '0', timerStart: '', repeat: '', reminded: '', createdBy: u, createdAt: new Date().toISOString() });
  await logEv(params.id, id, u, 'activity', 'membuat tugas'); emit(params.id, 'tasks'); return NextResponse.json({ ok: 1 });
}
