'use server';

import prisma from '@/lib/prisma';
import { StoreSchema } from '@/schemas';
import { revalidatePath } from 'next/cache';

export async function createUpdateStore(data: unknown) {
    const parsedData = StoreSchema.safeParse(data);

    if (!parsedData.success) {
        return {
            ok: false,
            message: 'Datos inválidos',
        };
    }

    try {
        const { id, ...storeData } = parsedData.data;

        const store = id
            ? await prisma.store.update({
                where: { id },
                data: storeData,
            })
            : await prisma.store.create({
                data: storeData,
            });

        revalidatePath('/tiendas');

        return {
            ok: true,
            message: id ? 'Tienda actualizada exitosamente' : 'Tienda creada exitosamente',
            store,
        };
    } catch (error) {
        console.error('Error al crear/actualizar tienda:', error);
        return {
            ok: false,
            message: 'Error al crear/actualizar tienda',
        };
    }
}