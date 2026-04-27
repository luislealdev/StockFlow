import z from "zod";

export const StockSchema = z.object({
    id: z.string().optional(),
    productId: z.string().uuid("El ID de producto no es válido"),
    storeId: z.string().uuid("El ID de tienda no es válido"),
    quantity: z.number().int().nonnegative("La cantidad debe ser un número entero no negativo"),
});