import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|manifest\\.json|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|css|js|map)$).*)',
  ],
}; 