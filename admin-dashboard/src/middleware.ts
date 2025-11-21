import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the auth-storage cookie which contains the Zustand persisted state
  const authStorage = request.cookies.get('auth-storage')?.value

  let hasValidToken = false

  // Try to parse the Zustand storage and check for token
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage)
      hasValidToken = !!parsed.state?.token
    } catch (e) {
      // Invalid JSON in cookie
      hasValidToken = false
    }
  }

  // Allow access to login page
  if (request.nextUrl.pathname === '/login') {
    // If already authenticated, redirect to dashboard
    if (hasValidToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!hasValidToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}


