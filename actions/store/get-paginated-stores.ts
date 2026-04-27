'use server';

import { PaginationProps } from '@/interfaces/pagination.interface';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getPaginatedStores({
    page,
    take = 10,
    search = '',
}: PaginationProps) {
    try {
        const skip = (page - 1) * take;

        const where: Prisma.StoreWhereInput = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        location: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }
            : {};

        const [data, total] = await Promise.all([
            prisma.store.findMany({
                where,
                skip,
                take,
                orderBy: {
                    name: 'asc',
                },
            }),
            prisma.store.count({ where }),
        ]);

        return {
            ok: true,
            data,
            total,
            totalPages: Math.ceil(total / take),
        };
    } catch (error) {
        console.error('Error al obtener tiendas paginadas:', error);

        return {
            ok: false,
            message: 'Error al obtener tiendas paginadas',
        };
    }
}