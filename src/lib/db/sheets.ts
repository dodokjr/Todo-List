import { google } from 'googleapis';
import type { Store, User, Workspace, Member, Task, Ev } from '../types';
// Buat 4 tab di Spreadsheet dengan header baris 1 persis seperti di bawah.
const cols: Record<string, string[]> = {
  users: ['id', 'name', 'email', 'passwordHash', 'resetToken', 'resetExp'],
  workspaces: ['id', 'code', 'name', 'type', 'ownerId'],
  members: ['workspaceId', 'userId', 'role'],
  tasks: ['id', 'workspaceId', 'title', 'status', 'priority', 'due', 'createdBy', 'createdAt', 'assignee', 'start', 'checklist', 'timeSec', 'timerStart', 'repeat', 'reminded'],
  events: ['id', 'workspaceId', 'taskId', 'userId', 'type', 'text', 'data', 'createdAt'],
};
const SID = () => process.env.GOOGLE_SHEET_ID!;
const api = () => google.sheets({ version: 'v4', auth: new google.auth.JWT(process.env.GOOGLE_CLIENT_EMAIL, undefined, (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'), ['https://www.googleapis.com/auth/spreadsheets']) });
async function all<T>(tab: string): Promise<T[]> {
  const r = await api().spreadsheets.values.get({ spreadsheetId: SID(), range: `${tab}!A2:Z` });
  return (r.data.values || []).map((v) => Object.fromEntries(cols[tab].map((c, i) => [c, v[i] ?? '']))) as T[];
}
const row = (tab: string, o: any) => [cols[tab].map((c) => o[c] ?? '')];
const add = async (tab: string, o: any) => { await api().spreadsheets.values.append({ spreadsheetId: SID(), range: `${tab}!A1`, valueInputOption: 'RAW', requestBody: { values: row(tab, o) } }); };
type Row = Record<string, string>;
async function upd(tab: string, match: (r: Row) => boolean, p: any) {
  const rs = await all<Row>(tab); const i = rs.findIndex(match); if (i < 0) return;
  await api().spreadsheets.values.update({ spreadsheetId: SID(), range: `${tab}!A${i + 2}`, valueInputOption: 'RAW', requestBody: { values: row(tab, { ...rs[i], ...p }) } });
}
async function del(tab: string, match: (r: Row) => boolean) {
  const a = api(); const rs = await all<Row>(tab);
  const idx = rs.map((r, i) => (match(r) ? i : -1)).filter((i) => i >= 0).reverse(); if (!idx.length) return;
  const m = await a.spreadsheets.get({ spreadsheetId: SID() });
  const sheetId = m.data.sheets!.find((s) => s.properties!.title === tab)!.properties!.sheetId;
  await a.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: idx.map((i) => ({ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: i + 1, endIndex: i + 2 } } })) } });
}
const byId = (id: string) => (r: Row) => r.id === id;
const find = async <T>(tab: string, f: (x: T) => boolean) => (await all<T>(tab)).find(f) || null;
export const sheetsStore: Store = {
  userByEmail: (e) => find<User>('users', (u) => u.email === e),
  userById: (id) => find<User>('users', (u) => u.id === id),
  userByReset: (t) => find<User>('users', (u) => u.resetToken === t),
  createUser: (u) => add('users', u), updateUser: (id, p) => upd('users', byId(id), p),
  createWorkspace: (w) => add('workspaces', w),
  workspaceByCode: (c) => find<Workspace>('workspaces', (w) => w.code === c),
  listWorkspaces: async (uid) => {
    const ids = (await all<Member>('members')).filter((m) => m.userId === uid).map((m) => m.workspaceId);
    return (await all<Workspace>('workspaces')).filter((w) => ids.includes(w.id));
  },
  updateWorkspace: (id, p) => upd('workspaces', byId(id), p),
  deleteWorkspace: async (id) => { await del('tasks', (r) => r.workspaceId === id); await del('events', (r) => r.workspaceId === id); await del('members', (r) => r.workspaceId === id); await del('workspaces', byId(id)); },
  memberRole: async (w, u) => { const m = (await all<Member>('members')).find((m) => m.workspaceId === w && m.userId === u); return m ? m.role || 'member' : null; },
  listMembers: async (w) => (await all<Member>('members')).filter((m) => m.workspaceId === w).map((m) => ({ ...m, role: m.role || 'member' })),
  setRole: (w, u, role) => upd('members', (r) => r.workspaceId === w && r.userId === u, { role }),
  removeMember: (w, u) => del('members', (r) => r.workspaceId === w && r.userId === u),
  addMember: (m) => add('members', m),
  addEvent: (e) => add('events', e), deleteEvent: (id) => del('events', byId(id)),
  listEvents: async (w) => (await all<Ev>('events')).filter((e) => e.workspaceId === w),
  dueTasks: async (up) => (await all<Task>('tasks')).filter((t) => t.due && t.due <= up && t.status !== 'done' && t.reminded !== '1'),
  isMember: async (w, u) => (await all<Member>('members')).some((m) => m.workspaceId === w && m.userId === u),
  listTasks: async (w) => (await all<Task>('tasks')).filter((t) => t.workspaceId === w),
  taskById: (id) => find<Task>('tasks', (t) => t.id === id),
  createTask: (t) => add('tasks', t), updateTask: (id, p) => upd('tasks', byId(id), p), deleteTask: (id) => del('tasks', byId(id)),
};
