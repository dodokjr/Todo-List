export type T = { id: string; title: string; status: string; priority: string; due: string; assignee: string; start: string; checklist: string; timeSec: string; timerStart: string; repeat: string };
export const COLS: [string, string][] = [['todo', 'Akan dikerjakan'], ['doing', 'Sedang berjalan'], ['done', 'Selesai']];
export const PR: Record<string, string> = { low: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', med: 'bg-amber-500/20 text-amber-700 dark:text-amber-300', high: 'bg-rose-500/20 text-rose-700 dark:text-rose-300' };
export const BAR: Record<string, string> = { low: 'bg-emerald-500', med: 'bg-amber-500', high: 'bg-rose-500' };
