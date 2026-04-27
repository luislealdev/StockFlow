"use client";

import { createUpdateCategory } from '@/actions/category';
import { CategorySchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '@prisma/client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

interface Props {
    category: Category | null;
    onClose: () => void;
    onSaved?: () => void;
}

export const CategoryForm = ({
    category,
    onClose,
    onSaved,
}: Props) => {

    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof CategorySchema>>({
        resolver: zodResolver(CategorySchema),
        defaultValues: {
            id: category?.id || undefined,
            name: category?.name || '',
        },
    });

    const handleSubmit = async (data: z.infer<typeof CategorySchema>) => {
        setIsLoading(true);
        try {
            const { ok, message } = await createUpdateCategory(data);

            if (ok) {
                toast.success(message || `Categoría ${data.id ? 'actualizada' : 'creada'} correctamente`);
                onSaved?.();
                onClose();
                form.reset({
                    id: undefined,
                    name: '',
                });
            } else {
                toast.error(message || 'Error al guardar la categoría');
            }
        } catch {
            toast.error('Error inesperado al guardar la categoría');
        } finally {
            setIsLoading(false);
        }
    };

    const isEditing = Boolean(category?.id);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-[2px]"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl shadow-slate-200/40">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                            {isEditing ? 'Editar categoría' : 'Nueva categoría'}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                            {isEditing ? 'Actualizar categoría' : 'Crear categoría'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Escribe un nombre claro para identificar esta categoría en el sistema.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                    <input type="hidden" {...form.register('id')} />

                    <div className="space-y-2">
                        <label htmlFor="category-name" className="text-sm font-medium text-slate-700">
                            Nombre
                        </label>
                        <input
                            id="category-name"
                            type="text"
                            placeholder="Ej. Abarrotes, Limpieza, Electrónica"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                            {...form.register('name')}
                        />
                        {form.formState.errors.name ? (
                            <p className="text-sm text-rose-600">{form.formState.errors.name.message}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear categoría'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
