'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function DeleteProduct(id: string) {
    try {
        await prisma.stock.deleteMany({
            where: {
                productId: id,
            },
        });

        await prisma.product.delete({
            where: {
                id,
            },
        });

        revalidatePath('/productos');

        return {
            ok: true,
            message: 'Producto eliminado exitosamente',
        };
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return {
            ok: false,
            message: 'Error al eliminar producto',
        };
    }
}