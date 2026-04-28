'use server';

import prisma from "@/lib/prisma";
import { CategorySchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export async function createUpdateCategory(data: unknown) {
    const parsedData = CategorySchema.safeParse(data);

    if (!parsedData.success) {
        return {
            ok: false,
            message: "Datos inválidos",
        }
    }

    try {
        const { id, ...categoryData } = parsedData.data;

        const category = id
            ? await prisma.category.update({
                where: { id },
                data: categoryData,
            })
            : await prisma.category.create({
                data: categoryData,
            });

        revalidatePath('/categorias');

        return {
            ok: true,
            message: id ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente',
            category,
        }
    } catch (error) {
        console.error("Error al guardar categoría:", error);
        return {
            ok: false,
            message: `Error en guardar categoría`,
        }
    }

}