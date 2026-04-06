import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/actividades', '/laboratorios', '/reservas', '/incidencias'];

export function middleware(request: NextRequest) {
  const token    = request.cookies.get('access_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Proteger rutas autenticadas
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirigir raíz a dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
