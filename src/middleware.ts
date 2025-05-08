import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    /*

     * Match all paths except for:

     * 1. /api routes

     * 2. /_next (Next.js internals)

     * 3. /_static (inside /public)

     * 4. all root files inside /public (e.g. /favicon.ico)

     */

    '/((?!api/|images/|.well-known/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('✅ Middleware running on:', pathname)

  // Extract the first segment as the slug
  const match = pathname.match(/^\/([^\/]+)(\/|$)/)
  const slug = match?.[1]

  const existing = request.cookies.get('organisation')
  console.log({ slug, existing, pathname })
  if (slug && (!existing || existing.value !== slug)) {
    const response = NextResponse.next()
    response.cookies.set('organisation', slug, {
      path: '/',
      httpOnly: true,
    })
    console.log('✅ Setting cookie: organisation =', slug)
    return response
  }

  return NextResponse.next()
}
