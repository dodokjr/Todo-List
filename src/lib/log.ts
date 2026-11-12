import { nanoid } from 'nanoid';
import { db } from './db';
import { emit } from './bus';
// type: comment | activity | time | template
export async function logEv(wid: string, taskId: string, userId: string, type: string, text: string, data = '') {
  await db.addEvent({ id: nanoid(), workspaceId: wid, taskId, userId, type, text, data, createdAt: new Date().toISOString() });
  emit(wid, 'log');
}
