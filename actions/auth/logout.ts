'use server';

import { signOut } from "@/auth.config";

export const logout = async () => {
    try {
        await signOut({
            redirectTo: "/auth",
            redirect: false
        });

        return {
            ok: true,
            message: "Sesión cerrada correctamente",
        };
    } catch (error) {
        return {
            ok: false,
            message: "No se pudo cerrar la sesión",
        };
    }
}