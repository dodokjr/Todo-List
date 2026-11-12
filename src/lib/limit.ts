const g = globalThis as any;
const m: Map<string, { n: number; t: number }> = g.__rl || (g.__rl = new Map());
// true bila sudah melewati batas percobaan dalam jendela waktu
export function limited(key: string, max = 10, win = 900000) {
  const now = Date.now(); const e = m.get(key);
  if (!e || e.t < now) { m.set(key, { n: 1, t: now + win }); return false; }
  return ++e.n > max;
}
