import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/') // ['', 'acme', 'dashboard']

  const organisation = segments[1]
  const hasSubPath = segments.length > 2 // ensure there's something after /[organisation]

  const response = NextResponse.next()

  if (
    organisation &&
    hasSubPath &&
    ![
      '_next',
      'favicon.ico',
      '.well-known',
      'api',
      '_static',
      '_vercel',
      'images',
      'admin',
    ].includes(organisation)
  ) {
    response.cookies.set('organisation', organisation, {
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api/|admin/|_next/|_static/|_vercel/|\\.well-known/|[\\w-]+\\.\\w+).*)',
  ],
}
