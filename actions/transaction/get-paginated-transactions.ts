import { PaginationProps } from "@/interfaces";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getPaginatedTransactions({
    page = 1,
    take = 20,
    search = '',
}: PaginationProps) {
    try {

        const where: Prisma.TransactionWhereInput = {
            OR: [
                {
                    product: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    fromStore: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    toStore: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
            ],
        };

        const [data, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip: (page - 1) * take,
                take,
                orderBy: {
                    timestamp: 'desc',
                },
                include: {
                    product: true,
                    fromStore: true,
                    toStore: true,
                },
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            ok: true,
            data: data,
            total: total,
            totalPages: Math.ceil(total / take),
        };
    } catch (error) {
        console.error('Error al obtener transacciones paginadas:', error);
        return {
            ok: false,
            message: 'Error al obtener transacciones paginadas',
        };
    }
}