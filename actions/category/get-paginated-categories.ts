'use server';

import { PaginationProps } from "@/interfaces/pagination.interface";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getPaginatedCategories({
    page,
    take = 10,
    search = '',
}: PaginationProps) {
    try {
        const skip = (page - 1) * take;

        const where: Prisma.CategoryWhereInput = search
            ? {
                name: {
                    contains: search,
                    mode: 'insensitive',
                },
            }
            : {};

        const [data, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take,
            }),
            prisma.category.count({ where }),
        ]);

        return {
            ok: true,
            data,
            total,
            totalPages: Math.ceil(total / take),
        };
    } catch (error) {
        console.error("Error al obtener categorías paginadas:", error);

        return {
            ok: false,
            message: "Error al obtener categorías paginadas",
        };
    }
}