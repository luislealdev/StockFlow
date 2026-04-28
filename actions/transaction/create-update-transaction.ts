'use server';

import prisma from "@/lib/prisma";
import { TransactionSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export async function createUpdateTransaction(data: unknown) {
    const parsedData = TransactionSchema.safeParse(data);


    if (!parsedData.success) {
        return {
            ok: false,
            message: "Datos inválidos",
        }
    }

    try {
        const { id, ...transactionData } = parsedData.data;

        // Validar stock para transacciones de tipo "Salida" o "Transferencia"
        if (transactionData.type === "OUT" || transactionData.type === "TRANSFER") {
            const currentStock = await prisma.stock.findUnique({
                where: {
                    productId_storeId: {
                        productId: transactionData.productId,
                        storeId: transactionData.fromStoreId!,
                    },
                },
            });

            if (!currentStock || currentStock.quantity < transactionData.quantity) {
                return {
                    ok: false,
                    message: "Stock insuficiente para realizar la transacción",
                }
            }
        }

        // Aumentar stock para transacciones de tipo "Entrada o "Transferencia"
        if (transactionData.type === "IN" || transactionData.type === "TRANSFER") {
            await prisma.stock.upsert({
                where: {
                    productId_storeId: {
                        productId: transactionData.productId,
                        storeId: transactionData.toStoreId!,
                    },
                },
                update: {
                    quantity: {
                        increment: transactionData.quantity,
                    },
                },
                create: {
                    productId: transactionData.productId,
                    storeId: transactionData.toStoreId!,
                    quantity: transactionData.quantity,
                },
            });
        }

        // Disminuir stock para transacciones de tipo "Salida" o "Transferencia"
        if (transactionData.type === "OUT" || transactionData.type === "TRANSFER") {
            await prisma.stock.update({
                where: {
                    productId_storeId: {
                        productId: transactionData.productId,
                        storeId: transactionData.fromStoreId!,
                    },
                },
                data: {
                    quantity: {
                        decrement: transactionData.quantity,
                    },
                },
            });
        }

        const transaction = id
            ? await prisma.transaction.update({
                where: { id },
                data: transactionData,
            })
            : await prisma.transaction.create({
                data: transactionData,
            });

        revalidatePath('/transacciones');
        revalidatePath('/productos'); 

        return {
            ok: true,
            message: id ? 'Transacción actualizada exitosamente' : 'Transacción creada exitosamente',
            transaction,
        }
    } catch (error) {
        console.error("Error al guardar transacción:", error);
        return {
            ok: false,
            message: "Error al guardar transacción",
        }
    }
}