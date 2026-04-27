"use client";

import { DeleteCategory } from '@/actions/category';
import { PaginatedComponentProps } from '@/interfaces';
import { Category } from '@prisma/client';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryForm } from './CategoryForm';

export const CategoriesTable = ({
    data,
    page,
    take,
    search,
    total,
    totalPages
}: PaginatedComponentProps<Category>) => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

    const updateQuery = React.useCallback((updates: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === '' || Number.isNaN(value)) {
                params.delete(key);
                return;
            }

            params.set(key, String(value));
        });

        router.push(`?${params.toString()}`);
    }, [router, searchParams]);

    const openCreateModal = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const closeModal = () => {
        setIsFormOpen(false);
        setSelectedCategory(null);
    };

    const handleDelete = async (category: Category) => {
        toast(`¿Eliminar "${category.name}"?`, {
            description: 'Esta acción no se puede deshacer.',
            duration: 8000,
            action: {
                label: 'Eliminar',
                onClick: async () => {
                    setIsDeleting(category.id);

                    try {
                        const result = await DeleteCategory(category.id);

                        if (result.ok) {
                            toast.success(result.message || 'Categoría eliminada exitosamente');
                        } else {
                            toast.error(result.message || 'No se pudo eliminar la categoría');
                        }
                    } catch {
                        toast.error('Error inesperado al eliminar la categoría');
                    } finally {
                        setIsDeleting(null);
                    }
                },
            },
            cancel: {
                label: 'Cancelar',
                onClick: () => undefined,
            },
        });
    };

    const isEmpty = data.length === 0;
    const startItem = isEmpty ? 0 : (page - 1) * take + 1;
    const endItem = isEmpty ? 0 : startItem + data.length - 1;

    return (
        <section className="min-h-[calc(100vh-2rem)] bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                                Catálogo
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                Categorías
                            </h1>
                            <p className="text-sm leading-6 text-slate-600 sm:text-base">
                                Administra, busca y edita las categorías que usarás en el resto del sistema.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Plus className="h-4 w-4" />
                            Nueva categoría
                        </button>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Total</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">{total}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Página actual</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {page} / {Math.max(totalPages, 1)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Mostrando</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {startItem} - {endItem}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-6">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            updateQuery({
                                search: String(formData.get('search') || ''),
                                page: 1,
                            });
                        }}
                        className="flex flex-col gap-3 lg:flex-row lg:items-center"
                    >
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                name="search"
                                defaultValue={search}
                                placeholder="Buscar por nombre de categoría"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                                <span className="whitespace-nowrap">Por página</span>
                                <select
                                    value={take}
                                    onChange={(event) => updateQuery({ take: Number(event.target.value), page: 1 })}
                                    className="bg-transparent text-slate-900 outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </label>

                            <button
                                type="submit"
                                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Nombre</th>
                                        <th className="px-5 py-4">ID</th>
                                        <th className="px-5 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {isEmpty ? (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-16 text-center text-slate-500">
                                                No hay categorías para mostrar.
                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={openCreateModal}
                                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                    >
                                                        Crear primera categoría
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((category) => (
                                            <tr key={category.id} className="transition hover:bg-slate-50">
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-slate-950">{category.name}</div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-500">
                                                    <span className="max-w-[16rem] truncate block">{category.id}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(category)}
                                                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isDeleting === category.id}
                                                            onClick={() => handleDelete(category)}
                                                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            {isDeleting === category.id ? 'Eliminando...' : 'Eliminar'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Mostrando {startItem} - {endItem} de {total} registros
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => updateQuery({ page: page - 1 })}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                                Página {page} de {Math.max(totalPages, 1)}
                            </span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => updateQuery({ page: page + 1 })}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isFormOpen &&
                <CategoryForm
                    category={selectedCategory}
                    onClose={closeModal}
                />
            }
        </section>
    )
}
