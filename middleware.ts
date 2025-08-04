import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile', 
    '/business-dashboard',
    '/orders',
    '/business',
  ]

  // Routes that authenticated users shouldn't access
  const authRoutes = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/get-started'
  ]

  const { pathname } = req.nextUrl

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Get auth token from cookies
  const authToken = req.cookies.get('sb-access-token')?.value || 
                   req.cookies.get('supabase-auth-token')?.value

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !authToken) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes to dashboard  
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
