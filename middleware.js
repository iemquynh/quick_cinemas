import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
}; 