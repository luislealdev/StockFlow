import { createUpdateTransaction, deleteTransaction, getPaginatedTransactions } from '@/actions/transaction';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    const method = req.method;

    switch (method) {
        case 'GET': {
            const url = new URL(req.url);
            const data = await getPaginatedTransactions({
                page: Number(url.searchParams.get('page')) || 1,
                take: Number(url.searchParams.get('take')) || 20,
                search: url.searchParams.get('search') || '',
            });

            return NextResponse.json({
                ok: true,
                data,
            });
        }

        case 'POST':
        case 'PUT': {
            const body = await req.json();
            const { ok, message } = await createUpdateTransaction(body);
            return NextResponse.json({
                ok,
                message,
            });
        }

        case 'DELETE': {
            const body = await req.json();
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