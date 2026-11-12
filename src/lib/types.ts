export type User = { id: string; name: string; email: string; passwordHash: string; resetToken?: string | null; resetExp?: number | string | null };
export type Workspace = { id: string; code: string; name: string; type: 'personal' | 'team' | string; ownerId: string };
export type Role = 'admin' | 'member';
export type Member = { workspaceId: string; userId: string; role: Role | string };
export type Task = { id: string; workspaceId: string; title: string; status: string; priority: string; due: string; assignee: string; start: string; checklist: string; timeSec: string; timerStart: string; repeat: string; reminded: string; createdBy: string; createdAt: string };
export type Ev = { id: string; workspaceId: string; taskId: string; userId: string; type: string; text: string; data: string; createdAt: string }; // type: comment | activity | time | template
export interface Store {
  addEvent(e: Ev): Promise<void>; listEvents(wid: string): Promise<Ev[]>; deleteEvent(id: string): Promise<void>; dueTasks(upTo: string): Promise<Task[]>;
  userByEmail(e: string): Promise<User | null>; userById(id: string): Promise<User | null>; userByReset(t: string): Promise<User | null>;
  createUser(u: User): Promise<void>; updateUser(id: string, p: Partial<User>): Promise<void>;
  createWorkspace(w: Workspace): Promise<void>; workspaceByCode(c: string): Promise<Workspace | null>; listWorkspaces(uid: string): Promise<Workspace[]>;
  updateWorkspace(id: string, p: Partial<Workspace>): Promise<void>; deleteWorkspace(id: string): Promise<void>;
  memberRole(wid: string, uid: string): Promise<string | null>; listMembers(wid: string): Promise<Member[]>;
  setRole(wid: string, uid: string, role: string): Promise<void>; removeMember(wid: string, uid: string): Promise<void>;
  addMember(m: Member): Promise<void>; isMember(wid: string, uid: string): Promise<boolean>;
  listTasks(wid: string): Promise<Task[]>; taskById(id: string): Promise<Task | null>;
  createTask(t: Task): Promise<void>; updateTask(id: string, p: Partial<Task>): Promise<void>; deleteTask(id: string): Promise<void>;
}
