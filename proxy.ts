import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicApiPaths = new Set(['/api/fake-data']);
const privateApiPrefix = '/api/';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(privateApiPrefix) || publicApiPaths.has(pathname)) {
    return NextResponse.next();
  }

  const expectedAuthorization = `Bearer ${process.env.API_KEY}`;

  if (request.headers.get('authorization') !== expectedAuthorization) {
    console.log(request.headers.get('authorization'));
    console.log(expectedAuthorization);

    return NextResponse.json(
      {
        ok: false,
        message: 'Bearer token es requerido para acceder a esta ruta',
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};