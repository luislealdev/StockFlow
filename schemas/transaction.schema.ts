import { TransactionType } from "@prisma/client";
import z from "zod";

export const TransactionSchema = z.object({
    id: z.string().optional(),
    type: z.nativeEnum(TransactionType),
    productId: z.string(),
    fromStoreId: z.string().optional(),
    toStoreId: z.string().optional(),
    quantity: z.number().int().positive("La cantidad debe ser un número entero positivo"),
});