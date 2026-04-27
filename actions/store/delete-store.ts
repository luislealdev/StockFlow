'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function DeleteStore(id: string) {
    try {
        await prisma.store.delete({
            where: {
                id,
            },
        });

        return {
            ok: true,
            message: 'Tienda eliminada exitosamente',
        };

        revalidatePath('/tiendas');
    } catch (error) {
        console.error('Error al eliminar tienda:', error);
        return {
            ok: false,
            message: 'Error al eliminar tienda',
        };
    }
}