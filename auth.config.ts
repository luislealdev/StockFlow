import NextAuth from "next-auth";
import { z } from "zod";
import Credentials from 'next-auth/providers/credentials';
import prisma from "@/lib/prisma";
import bcryptjs from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth',
    },
    callbacks: {
        authorized({ }) {
            return true;
        },

        jwt({ token, user }) {
            if (user) {
                token.data = user;
            }

            return token;
        },

        session({ session, token }) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session.user = token.data as any;
            return session;
        },
    },
    providers: [
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log('[auth][credentials] authorize() started');

                    if (!credentials?.email || !credentials?.password) {
                        console.log('[auth][credentials] missing email or password');
                        return null;
                    }

                    const parsedCredentials = z
                        .object({
                            email: z.string().email(),
                            password: z.string().min(6)
                        })
                        .safeParse(credentials);

                    if (!parsedCredentials.success) {
                        console.log('[auth][credentials] validation failed', parsedCredentials.error.flatten().fieldErrors);
                        return null;
                    }

                    const { email, password } = parsedCredentials.data;
                    const normalizedEmail = email.toLowerCase();

                    console.log('[auth][credentials] looking up user', { email: normalizedEmail });

                    // Buscar el correo
                    const user = await prisma.user.findFirst({
                        where: { email: normalizedEmail }
                    });

                    console.log('[auth][credentials] user lookup result', {
                        found: Boolean(user),
                        hasPassword: Boolean(user?.password),
                    });

                    if (!user || !user.password) {
                        console.log('[auth][credentials] user missing or password not set');
                        return null;
                    }

                    // Comparar las contraseñas
                    const isValidPassword = bcryptjs.compareSync(password, user.password);
                    console.log('[auth][credentials] password comparison result', { isValidPassword });

                    if (!isValidPassword) {
                        return null;
                    }

                    // Regresar el usuario sin el password
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { password: _, ...rest } = user;

                    console.log('[auth][credentials] authorize() success', { userId: user.id, email: user.email });

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return { ...rest, id: user.id } as any;
                } catch (error) {
                    console.error('[auth][credentials] authorize() failed with error', error);
                    return null;
                }
            },
        }),
    ],
});
export const authConfig = {
    trustHost: true,
};