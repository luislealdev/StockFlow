'use server';

import prisma from "@/lib/prisma";

export async function DeleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: {
                id,
            },
        });

        return {
            ok: true,
            message: "Categoría eliminada exitosamente",
        }
    } catch (error) {
        console.error("Error al eliminar categoría:", error);
        return {
            ok: false,
            message: "Error al eliminar categoría",
        }
    }
}