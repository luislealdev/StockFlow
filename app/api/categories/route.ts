import { createUpdateCategory, getPaginatedCategories } from "@/actions/category";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {

    if (req.headers.get('authorization') !== `Bearer ${process.env.API_SECRET}`) {
        return NextResponse.json({
            ok: false,
            message: `Bearer token es requerido para acceder a esta ruta`
        }, {
            status: 401
        });
    }

    const method = req.method;
    const body = await req.json();

    switch (method) {
        case 'GET':
            const data = await getPaginatedCategories({
                page: Number(body.page) || 1,
                take: Number(body.take) || 10,
                search: body.search || '',
            });
            return NextResponse.json({
                ok: true,
                data
            });

        case 'POST':
            const { ok, message } = await createUpdateCategory(body);
            return NextResponse.json({
                ok,
                message
            });

        case 'PUT':
            const { ok: updateOk, message: updateMessage } = await createUpdateCategory(body);
            return NextResponse.json({
                ok: updateOk,
                message: updateMessage
            });

        default:
            return NextResponse.json({
                ok: false,
                message: `Método ${method} no permitido`
            }, {
                status: 405
            });
    }
}