import z from "zod";
import { StockSchema } from './stock.schema';

export const ProductSchema = z.object({
    id: z.string().optional(),
    SKU: z.string().optional(),
    name: z.string().min(1, "El nombre es requerido"),
    price: z.coerce.number().positive("El precio debe ser un número positivo"),
    categoryId: z.string().min(1, "La categoría es requerida"),
    stocks: z.array(StockSchema).optional(),
});