'use server';

import prisma from "@/lib/prisma";
import { UserSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUpdateUser(data: unknown) {
    const parsedData = UserSchema.safeParse(data);

    if (!parsedData.success) {
        return {
            ok: false,
            message: "Datos inválidos",
        }
    }


    try {
        const { id, password, ...userData } = parsedData.data;

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const user = id
            ? await prisma.user.update({
                where: { id },
                data: {
                    ...userData,
                    password: hashedPassword,
                }
            })
            : await prisma.user.create({
                data: {
                    ...userData,
                    password: hashedPassword!,
                },
            });

        revalidatePath('/usuarios');

        return {
            ok: true,
            message: id ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
            user,
        }
    } catch (error) {
        console.error("Error al guardar usuario:", error);
        return {
            ok: false,
            message: `Error en guardar usuario`,
        }
    }
}