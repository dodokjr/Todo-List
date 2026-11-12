import { nanoid, customAlphabet } from 'nanoid';
import { db } from './db';
const code = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
export async function mkWs(owner: string, name: string, type: 'personal' | 'team') {
  const w = { id: nanoid(), code: code(), name, type, ownerId: owner };
  await db.createWorkspace(w); await db.addMember({ workspaceId: w.id, userId: owner, role: 'admin' }); return w;
}
