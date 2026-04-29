
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {

    console.log("Proxy");


    if (req.headers.get('Authorization') !== `Bearer ${process.env.API_SECRET}`) {
        return NextResponse.json({
            ok: false,
            message: `Bearer token es requerido para acceder a esta ruta`
        }, {
            status: 401
        });
    }

    return NextResponse.next();
}
