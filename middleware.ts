import { NextResponse, NextRequest } from 'next/server'
import { createServerClientMiddleware } from '@/lib/supabase-server'

export async function middleware(req: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClientMiddleware(req, response)

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

  try {
    // Get the current user
    const { data: { user }, error } = await supabase.auth.getUser()

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && (!user || error)) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users from auth routes to dashboard  
    if (isAuthRoute && user && !error) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

  } catch (error) {
    console.error('Middleware auth error:', error)
    // If there's an auth error and it's a protected route, redirect to signin
    if (isProtectedRoute) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/stripe (stripe webhooks and checkout)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/stripe|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
