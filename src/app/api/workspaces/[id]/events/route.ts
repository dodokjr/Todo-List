import { getUid } from '@/lib/auth';
import { db } from '@/lib/db';
import { on } from '@/lib/bus';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const u = await getUid();
  if (!u || !(await db.isMember(params.id, u))) return new Response('Dilarang', { status: 403 });
  const enc = new TextEncoder(); let off = () => {}; let hb: any;
  const stream = new ReadableStream({
    start(c) {
      const send = (t: string) => { try { c.enqueue(enc.encode(`data: ${t}\n\n`)); } catch {} };
      send('ready'); off = on(params.id, send); hb = setInterval(() => send('ping'), 25000);
      req.signal.addEventListener('abort', () => { off(); clearInterval(hb); try { c.close(); } catch {} });
    },
    cancel() { off(); clearInterval(hb); },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } });
}
