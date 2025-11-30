import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  const { pathname } = request.nextUrl;

  // Allow access to login page without token
  if (pathname === '/admin/login') {
    // If already logged in, redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Redirect /admin to /admin/dashboard
  if (pathname === '/admin') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // For all other admin routes, require authentication
  if (pathname.startsWith('/admin/')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
