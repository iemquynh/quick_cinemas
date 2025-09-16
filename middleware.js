// import { NextResponse } from 'next/server';

// export function middleware(request) {
//   const { pathname } = request.nextUrl;

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!_next|manifest\\.json|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|css|js|map)$).*)',
//   ],
// }; 

import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Bạn có thể thêm logic check token ở đây sau
  // Ví dụ: nếu chưa login mà vào /profile thì redirect sang /auth/login
  // const token = request.cookies.get('authToken')?.value;
  // if (!token && pathname.startsWith('/profile')) {
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/my-tickets/:path*',
    '/book/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};
