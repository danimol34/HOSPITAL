import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error')
  const errorDescription = request.nextUrl.searchParams.get('error_description')

  if (error || errorDescription) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('message', errorDescription || error || 'Enlace inválido o expirado.')
    return NextResponse.redirect(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
