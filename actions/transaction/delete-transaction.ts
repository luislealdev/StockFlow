'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteTransaction = async (id: string) => {
    try {
        await prisma.transaction.delete({
            where: { id },
        });

        revalidatePath('/transacciones');

        return {
            ok: true,
            message: 'Transacción eliminada exitosamente',
        };
    } catch (error) {
        console.error('Error al eliminar transacción:', error);
        return {
            ok: false,
            message: 'Error al eliminar transacción',
        };
    }
}