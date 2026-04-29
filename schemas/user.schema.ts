import z from "zod";

export const UserSchema = z.object({
    id: z.string().optional(),
    email: z.string().email(),
    name: z.string().min(2).max(100),
    password: z.string().min(6).max(100).optional(),
});