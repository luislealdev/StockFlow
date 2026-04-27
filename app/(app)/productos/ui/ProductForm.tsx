"use client";

import { createUpdateProduct } from '@/actions/product';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { IProductExtended } from '../../../../interfaces';
import { Category, Store } from '@prisma/client';
import { ProductSchema } from '@/schemas';

interface Props {
    product: IProductExtended | null;
    categories: Category[];
    stores: Store[];
    onClose: () => void;
    onSaved?: () => void;
}

type ProductFormValues = z.infer<typeof ProductSchema>;

export const ProductForm = ({
    product,
    categories,
    stores,
    onClose,
    onSaved, 
}: Props) => {
    const [isLoading, setIsLoading] =useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            id: product?.id || undefined,
            SKU: product?.SKU || '',
            name: product?.name || '',
            price: product?.price || 0,
            categoryId: product?.categoryId || '',
            stocks: product?.stocks?.length
                ? product.stocks.map((stock) => ({
                    storeId: stock.storeId,
                    quantity: stock.quantity,
                }))
                : [{ storeId: '', quantity: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'stocks',
    });

    const handleSubmit = async (data: ProductFormValues) => {
        setIsLoading(true);
        try {
            const { ok, message } = await createUpdateProduct(data);

            if (ok) {
                toast.success(message || `Producto ${data.id ? 'actualizado' : 'creado'} correctamente`);
                onSaved?.();
                onClose();
                form.reset({
                    id: undefined,
                    SKU: '',
                    name: '',
                    price: 0,
                    categoryId: '',
                    stocks: [{ storeId: '', quantity: 0 }],
                });
            } else {
                toast.error(message || 'Error al guardar el producto');
            }
        } catch {
            toast.error('Error inesperado al guardar el producto');
        } finally {
            setIsLoading(false);
        }
    };

    const isEditing = Boolean(product?.id);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-[2px]"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl shadow-slate-200/40">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                            {isEditing ? 'Editar producto' : 'Nuevo producto'}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                            {isEditing ? 'Actualizar producto' : 'Crear producto'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Registra el producto, su categoría y el stock por tienda.
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

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <input type="hidden" {...form.register('id')} />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="product-name" className="text-sm font-medium text-slate-700">
                                Nombre
                            </label>
                            <input
                                id="product-name"
                                type="text"
                                placeholder="Ej. Shampoo 500ml"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                                {...form.register('name')}
                            />
                            {form.formState.errors.name ? (
                                <p className="text-sm text-rose-600">{form.formState.errors.name.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="product-sku" className="text-sm font-medium text-slate-700">
                                SKU
                            </label>
                            <input
                                id="product-sku"
                                type="text"
                                placeholder="Opcional"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                                {...form.register('SKU')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="product-price" className="text-sm font-medium text-slate-700">
                                Precio
                            </label>
                            <input
                                id="product-price"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                                {...form.register('price', { valueAsNumber: true })}
                            />
                            {form.formState.errors.price ? (
                                <p className="text-sm text-rose-600">{form.formState.errors.price.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="product-category" className="text-sm font-medium text-slate-700">
                                Categoría
                            </label>
                            <select
                                id="product-category"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                                {...form.register('categoryId')}
                            >
                                <option value="">Selecciona una categoría</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.categoryId ? (
                                <p className="text-sm text-rose-600">{form.formState.errors.categoryId.message}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-950">Stock por tienda</h3>
                                <p className="text-sm text-slate-600">
                                    Asigna cantidades por sucursal. Puedes agregar o quitar filas.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => append({ storeId: '', quantity: 0 })}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Agregar tienda
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_140px_auto] sm:items-end">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Tienda
                                        </label>
                                        <select
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                                            {...form.register(`stocks.${index}.storeId` as const)}
                                        >
                                            <option value="">Selecciona una tienda</option>
                                            {stores.map((store) => (
                                                <option key={store.id} value={store.id}>
                                                    {store.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                                            {...form.register(`stocks.${index}.quantity` as const, { valueAsNumber: true })}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
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
                            {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}