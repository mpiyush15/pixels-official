import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin-token')?.value;
  const clientSession = request.cookies.get('client-session')?.value;
  const { pathname } = request.nextUrl;

  // ============ ADMIN ROUTES ============
  
  // Allow access to admin login page without token
  if (pathname === '/admin/login') {
    // If already logged in, redirect to dashboard
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Redirect /admin to /admin/dashboard
  if (pathname === '/admin') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // For all other admin routes, require authentication
  if (pathname.startsWith('/admin/')) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // ============ CLIENT PORTAL ROUTES ============
  
  // Allow access to client login page without session
  if (pathname === '/client-portal/login') {
    // If already logged in, redirect to dashboard
    if (clientSession) {
      return NextResponse.redirect(new URL('/client-portal/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Allow access to forgot password page
  if (pathname === '/client-portal/forgot-password') {
    return NextResponse.next();
  }

  // Redirect /client-portal to /client-portal/dashboard
  if (pathname === '/client-portal') {
    if (clientSession) {
      return NextResponse.redirect(new URL('/client-portal/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/client-portal/login', request.url));
  }

  // For all other client portal routes, require authentication
  if (pathname.startsWith('/client-portal/')) {
    if (!clientSession) {
      return NextResponse.redirect(new URL('/client-portal/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/client-portal/:path*'],
};
