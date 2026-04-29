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
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const parsedCredentials = z
                        .object({
                            email: z.string().email(),
                            password: z.string().min(6)
                        })
                        .safeParse(credentials);

                    if (!parsedCredentials.success) {
                        return null;
                    }

                    const { email, password } = parsedCredentials.data;

                    // Buscar el correo
                    const user = await prisma.user.findFirst({
                        where: { email: email.toLowerCase() }
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    // Comparar las contraseñas
                    const isValidPassword = bcryptjs.compareSync(password, user.password);
                    if (!isValidPassword) {
                        return null;
                    }

                    // Regresar el usuario sin el password
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { password: _, ...rest } = user;

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return { ...rest, id: user.id } as any;
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
});
export const authConfig = {
    trustHost: true,
};