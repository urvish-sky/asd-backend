import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js RBAC Route Protection Middleware
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 *
 * Strictly enforces route protection across role portals:
 * - /parent: Requires role 'parent' or 'admin'
 * - /doctor: Requires role 'doctor' or 'admin' (strictly prohibits 'parent')
 * - /admin: Requires role 'admin'
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, next internal files, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/videos') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Retrieve auth token and role from cookies
  const authToken = request.cookies.get('asd_auth_token')?.value;
  const userRole = request.cookies.get('asd_user_role')?.value;

  const isAuthenticated = Boolean(authToken);

  // If already authenticated and visiting /login or /register, redirect to their role portal
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (userRole === 'doctor') {
      return NextResponse.redirect(new URL('/doctor', request.url));
    } else {
      return NextResponse.redirect(new URL('/parent', request.url));
    }
  }

  // 1. Doctor Portal (/doctor/*) Protection
  if (pathname.startsWith('/doctor')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Parents must NOT access clinician triage
    if (userRole === 'parent') {
      const unauthUrl = new URL('/unauthorized', request.url);
      unauthUrl.searchParams.set('reason', 'clinician_only');
      unauthUrl.searchParams.set('role', userRole);
      return NextResponse.redirect(unauthUrl);
    }
  }

  // 2. Parent Portal (/parent/*) Protection
  if (pathname.startsWith('/parent')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Admin Portal (/admin/*) Protection
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strictly restricted to admin role
    if (userRole !== 'admin') {
      const unauthUrl = new URL('/unauthorized', request.url);
      unauthUrl.searchParams.set('reason', 'admin_only');
      unauthUrl.searchParams.set('role', userRole || 'user');
      return NextResponse.redirect(unauthUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/parent/:path*', '/doctor/:path*', '/admin/:path*', '/login', '/register'],
};
