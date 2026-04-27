import z from "zod";

export const StockSchema = z.object({
    id: z.string().optional(),
    storeId: z.string().min(1, 'La tienda es requerida'),
    quantity: z.coerce.number().int().nonnegative("La cantidad debe ser un número entero no negativo"),
});