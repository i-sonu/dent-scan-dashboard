import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  'Aer0$epct-JWT-Sup3r-S3cr3t-2025-D0-N0t-Shar3'
)

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('auth_token')?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  try {
    await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] })
    return NextResponse.next()
  } catch (e) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
    response.cookies.set('auth_user', '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/missions/:path*',
    '/fleet/:path*',
    '/monitoring/:path*',
    '/preflight/:path*',
    '/upload/:path*',
    '/inspections/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/api/auth/logout',
    '/api/auth/me',
  ],
}
