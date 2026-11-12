import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, type Query } from 'firebase-admin/firestore';
import type { Store, User, Workspace, Member, Task, Ev } from '../types';
// Firestore (server-side via Admin SDK). Koleksi: users, workspaces, members, tasks.
function fs() {
  if (!getApps().length) initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n') }) });
  return getFirestore();
}
const col = (c: string) => fs().collection(c);
const list = async <T>(q: Query): Promise<T[]> => (await q.get()).docs.map((d) => d.data() as T);
const first = async <T>(q: Query): Promise<T | null> => { const s = await q.limit(1).get(); return s.empty ? null : (s.docs[0].data() as T); };
const get = async <T>(c: string, id: string): Promise<T | null> => { const d = await col(c).doc(id).get(); return d.exists ? (d.data() as T) : null; };
const mid = (w: string, u: string) => `${w}_${u}`;
export const firestoreStore: Store = {
  userByEmail: (e) => first<User>(col('users').where('email', '==', e)),
  userById: (id) => get<User>('users', id),
  userByReset: (t) => first<User>(col('users').where('resetToken', '==', t)),
  createUser: async (u) => { await col('users').doc(u.id).set(u); },
  updateUser: async (id, p) => { await col('users').doc(id).update(p as any); },
  createWorkspace: async (w) => { await col('workspaces').doc(w.id).set(w); },
  workspaceByCode: (c) => first<Workspace>(col('workspaces').where('code', '==', c)),
  listWorkspaces: async (uid) => {
    const ms = await list<Member>(col('members').where('userId', '==', uid));
    const ds = await Promise.all(ms.map((m) => col('workspaces').doc(m.workspaceId).get()));
    return ds.filter((d) => d.exists).map((d) => d.data() as Workspace);
  },
  updateWorkspace: async (id, p) => { await col('workspaces').doc(id).update(p as any); },
  deleteWorkspace: async (id) => {
    const b = fs().batch();
    for (const c of ['tasks', 'members', 'events']) (await col(c).where('workspaceId', '==', id).get()).docs.forEach((d) => b.delete(d.ref));
    b.delete(col('workspaces').doc(id)); await b.commit();
  },
  memberRole: async (w, u) => { const m = await get<Member>('members', mid(w, u)); return m ? m.role || 'member' : null; },
  listMembers: (w) => list<Member>(col('members').where('workspaceId', '==', w)),
  setRole: async (w, u, role) => { await col('members').doc(mid(w, u)).update({ role }); },
  removeMember: async (w, u) => { await col('members').doc(mid(w, u)).delete(); },
  addEvent: async (e) => { await col('events').doc(e.id).set(e); },
  deleteEvent: async (id) => { await col('events').doc(id).delete(); },
  listEvents: async (w) => (await list<Ev>(col('events').where('workspaceId', '==', w))).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  dueTasks: async (up) => (await list<Task>(col('tasks').where('due', '>=', '2000-01-01').where('due', '<=', up))).filter((t) => t.status !== 'done' && t.reminded !== '1'),
  addMember: async (m) => { await col('members').doc(mid(m.workspaceId, m.userId)).set(m); },
  isMember: async (w, u) => (await col('members').doc(mid(w, u)).get()).exists,
  listTasks: async (w) => (await list<Task>(col('tasks').where('workspaceId', '==', w))).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  taskById: (id) => get<Task>('tasks', id),
  createTask: async (t) => { await col('tasks').doc(t.id).set(t); },
  updateTask: async (id, p) => { await col('tasks').doc(id).update(p as any); },
  deleteTask: async (id) => { await col('tasks').doc(id).delete(); },
};
