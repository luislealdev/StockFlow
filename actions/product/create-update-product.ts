'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ProductSchema } from '../../schemas';

export async function createUpdateProduct(data: unknown) {
    const parsedData = ProductSchema.safeParse(data);

    if (!parsedData.success) {
        return {
            ok: false,
            message: 'Datos inválidos',
        };
    }

    try {
        const { id, stocks, ...productData } = parsedData.data;

        let product;

        if (id) {
            product = await prisma.product.update({
                where: { id },
                data: productData,
            });

            // actualizar stocks manualmente
            if (stocks)
                for (const stock of stocks) {
                    await prisma.stock.upsert({
                        where: {
                            productId_storeId: {
                                productId: id,
                                storeId: stock.storeId,
                            },
                        },
                        update: {
                            quantity: stock.quantity,
                        },
                        create: {
                            productId: id,
                            storeId: stock.storeId,
                            quantity: stock.quantity,
                        },
                    });
                }

        } else {
            product = await prisma.product.create({
                data: productData,
            });

            if (stocks)
                for (const stock of stocks) {
                    await prisma.stock.create({
                        data: {
                            productId: product.id,
                            storeId: stock.storeId,
                            quantity: stock.quantity,
                        },
                    });
                }
        }

        revalidatePath('/productos');

        return {
            ok: true,
            message: id
                ? 'Producto actualizado exitosamente'
                : 'Producto creado exitosamente',
            product,
        };

    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al guardar producto',
        };
    }
}