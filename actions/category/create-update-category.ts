'use server';

import prisma from "@/lib/prisma";
import { CategorySchema } from "@/schemas";

export async function createOrUpdateCategory(data: unknown) {
    const parsedData = CategorySchema.safeParse(data);

    if (!parsedData.success) {
        return {
            ok: false,
            message: "Datos inválidos",
        }
    }

    try {
        const category = await prisma.category.upsert({
            where: {
                id: parsedData.data.id || '',
            },
            update: {
                ...parsedData.data,
            },
            create: {
                ...parsedData.data,
            },
        });

        return {
            ok: true,
            message: `Categoría ${category.id ? 'actualizada' : 'creada'} exitosamente`,
            category,
        }
    } catch (error) {
        console.error("Error al crear/actualizar categoría:", error);
        return {
            ok: false,
            message: "Error al crear/actualizar categoría",
        }
    }

}