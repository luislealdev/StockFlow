import { TransactionType } from "@prisma/client";
import z from "zod";

export const TransactionSchema = z.object({
    id: z.string().optional(),
    type: z.nativeEnum(TransactionType),
    productId: z.string().uuid("El ID de producto no es válido"),
    fromStoreId: z.string().uuid("El ID de tienda de origen no es válido").optional(),
    toStoreId: z.string().uuid("El ID de tienda de destino no es válido").optional(),
    quantity: z.number().int().positive("La cantidad debe ser un número entero positivo"),
});