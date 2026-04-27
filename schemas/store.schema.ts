import z from "zod";

export const StoreSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre es requerido"),
    location: z.string().min(1, "La ubicación es requerida"),
});