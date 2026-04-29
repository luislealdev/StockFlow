"use client";

import { login } from "@/actions/auth/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const loginSchema = z.object({
    email: z.string().email("Ingresa un correo válido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        setIsLoading(true);

        try {
            const result = await login(values.email, values.password);

            if (!result.ok) {
                toast.error(result.message);
                return;
            }

            toast.success("Sesión iniciada correctamente");
            router.push("/");
        } catch {
            toast.error("No se pudo iniciar sesión");
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <section className="w-full max-w-sm rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-6">
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                    Acceso seguro
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Inicia sesión
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                    Ingresa tus credenciales para continuar.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-900">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        autoComplete="email"
                        {...form.register("email")}
                        className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                    {form.formState.errors.email ? (
                        <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-900">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Tu contraseña"
                        autoComplete="current-password"
                        {...form.register("password")}
                        className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                    {form.formState.errors.password ? (
                        <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p>
                    ) : null}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                    Iniciar sesión
                </button>
            </form>
        </section>
    );
};
