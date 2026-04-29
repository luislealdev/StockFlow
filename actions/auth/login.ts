"use server";

import { signIn } from "@/auth.config";


export async function login(email: string, password: string) {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // This is crucial to prevent the NEXT_REDIRECT error
    });

    if (result?.error) {
      return { ok: false, message: "Inicio de sesión fallido: el correo o la contraseña son incorrectos. Verifica tus credenciales." };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Error de autenticación: el correo o la contraseña son incorrectos. Si el problema persiste, contacta al administrador." };
  }
}