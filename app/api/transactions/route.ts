import { createUpdateTransaction, deleteTransaction, getPaginatedTransactions } from '@/actions/transaction';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    if (req.headers.get('authorization') !== `Bearer ${process.env.API_SECRET}`) {
        return NextResponse.json({
            ok: false,
            message: 'Bearer token es requerido para acceder a esta ruta',
        }, {
            status: 401,
        });
    }

    const method = req.method;
    const body = await req.json();

    switch (method) {
        case 'GET': {
            const data = await getPaginatedTransactions({
                page: Number(body.page) || 1,
                take: Number(body.take) || 20,
                search: body.search || '',
            });

            return NextResponse.json({
                ok: true,
                data,
            });
        }

        case 'POST':
        case 'PUT': {

            const { ok, message } = await createUpdateTransaction(body);
            return NextResponse.json({
                ok,
                message,
            });
        }

        case 'DELETE': {
            const { ok, message } = await deleteTransaction(body.id);
            return NextResponse.json({
                ok,
                message,
            });
        }

        default:
            return NextResponse.json({
                ok: false,
                message: 'Método no permitido',
            }, {
                status: 405,
            });
    }
}

export async function GET(req: NextRequest) {
    return handler(req);
}

export async function POST(req: NextRequest) {
    return handler(req);
}

export async function PUT(req: NextRequest) {
    return handler(req);
}

export async function DELETE(req: NextRequest) {
    return handler(req);
}