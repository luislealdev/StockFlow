'use server';

import { PaginationProps } from '@/interfaces/pagination.interface';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getPaginatedProducts({
    page,
    take = 10,
    search = '',
}: PaginationProps) {
    try {
        const skip = (page - 1) * take;

        const where: Prisma.ProductWhereInput = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        SKU: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }
            : {};

        const [data, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take,
                orderBy: {
                    name: 'asc',
                },
                include: {
                    stocks:true
                }
            }),
            prisma.product.count({ where }),
        ]);

        return {
            ok: true,
            data,
            total,
            totalPages: Math.ceil(total / take),
        };
    } catch (error) {
        console.error('Error al obtener productos paginados:', error);

        return {
            ok: false,
            message: 'Error al obtener productos paginados',
        };
    }
}