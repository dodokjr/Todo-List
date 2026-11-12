import { EventEmitter } from 'events';
const g = globalThis as any;
const bus: EventEmitter = g.__bus || (g.__bus = new EventEmitter());
bus.setMaxListeners(0);
// type: 'tasks' | 'members' | 'ws'
export const emit = (wid: string, type: string) => bus.emit(wid, type);
export const on = (wid: string, fn: (t: string) => void) => { bus.on(wid, fn); return () => { bus.off(wid, fn); }; };
