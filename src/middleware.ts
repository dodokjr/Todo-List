import { NextResponse, type NextRequest } from 'next/server';
export function middleware(r: NextRequest) {
  if (!r.cookies.get('s')) return NextResponse.redirect(new URL('/login', r.url));
}
export const config = { matcher: ['/dashboard/:path*'] };
