"use client";

import { createUpdateTransaction } from '@/actions/transaction';
import { IProductExtended, ITransactionExtended } from '@/interfaces';
import { TransactionSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, TransactionType } from '@prisma/client';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

interface Props {
    transaction: ITransactionExtended | null;
    products: IProductExtended[];
    stores: Store[];
    onClose: () => void;
    onSaved?: () => void;
}

const stepLabels = [
    'Tipo',
    'Producto',
    'Sucursales',
    'Cantidad',
    'Resumen',
];

export const TransactionForm = ({
    transaction,
    products,
    stores,
    onClose,
    onSaved,
}: Props) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [step, setStep] = React.useState(1);

    const form = useForm<z.TypeOf<typeof TransactionSchema>>({
        resolver: zodResolver(TransactionSchema),
        defaultValues: {
            id: transaction?.id || undefined,
            type: transaction?.type || TransactionType.IN,
            productId: transaction?.productId || '',
            fromStoreId: transaction?.fromStoreId || undefined,
            toStoreId: transaction?.toStoreId || undefined,
            quantity: transaction?.quantity || 1,
        },
    });

    const watchedType = useWatch({ control: form.control, name: 'type' });
    const watchedProductId = useWatch({ control: form.control, name: 'productId' });
    const watchedFromStoreId = useWatch({ control: form.control, name: 'fromStoreId' });
    const watchedToStoreId = useWatch({ control: form.control, name: 'toStoreId' });
    const watchedQuantity = useWatch({ control: form.control, name: 'quantity' });

    const selectedProduct = products.find((product) => product.id === watchedProductId);
    const originStock = watchedFromStoreId
        ? selectedProduct?.stocks.find((stock) => stock.storeId === watchedFromStoreId)?.quantity ?? 0
        : 0;

    const currentStepFields: Record<number, (keyof z.TypeOf<typeof TransactionSchema>)[]> = {
        1: ['type'],
        2: ['productId'],
        3: watchedType === TransactionType.IN
            ? ['toStoreId']
            : watchedType === TransactionType.OUT
                ? ['fromStoreId']
                : ['fromStoreId', 'toStoreId'],
        4: ['quantity'],
        5: [],
    };

    const movementLabel = watchedType === TransactionType.IN
        ? 'Entrada'
        : watchedType === TransactionType.OUT
            ? 'Salida'
            : 'Transferencia';

    const selectedFromStore = stores.find((store) => store.id === watchedFromStoreId);
    const selectedToStore = stores.find((store) => store.id === watchedToStoreId);

    const handleNext = async () => {
        const valid = await form.trigger(currentStepFields[step]);
        if (valid) {
            setStep((current) => Math.min(current + 1, 5));
        }
    };

    const handleSubmit = async (data: z.TypeOf<typeof TransactionSchema>) => {
        setIsLoading(true);
        try {
            const { ok, message } = await createUpdateTransaction(data);

            if (ok) {
                toast.success(message || `Movimiento ${data.id ? 'actualizado' : 'registrado'} correctamente`);
                onSaved?.();
                onClose();
                form.reset({
                    id: undefined,
                    type: TransactionType.IN,
                    productId: undefined,
                    fromStoreId: undefined,
                    toStoreId: undefined,
                    quantity: 1,
                });
                setStep(1);
            } else {
                toast.error(message || 'Error al guardar el movimiento');
            }
        } catch {
            toast.error('Error inesperado al guardar el movimiento');
        } finally {
            setIsLoading(false);
        }
    };

    const isEditing = Boolean(transaction?.id);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-[2px]"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl shadow-slate-200/40">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                            {isEditing ? 'Editar movimiento' : 'Nuevo movimiento'}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                            {isEditing ? 'Actualizar transacción' : 'Registrar transacción'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Sigue el paso a paso para registrar entradas, salidas o transferencias.
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

                <div className="mb-6 grid gap-2 sm:grid-cols-5">
                    {stepLabels.map((label, index) => {
                        const current = index + 1;
                        const active = current === step;
                        const completed = current < step;

                        return (
                            <div
                                key={label}
                                className={`rounded-2xl border px-3 py-3 text-center text-sm transition ${active
                                    ? 'border-slate-950 bg-slate-950 text-white'
                                    : completed
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 bg-slate-50 text-slate-500'
                                    }`}
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <input type="hidden" {...form.register('id')} />

                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-950">Tipo de transacción</h3>
                                <p className="text-sm text-slate-600">Primero define si será una entrada, salida o transferencia.</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {([
                                    { value: TransactionType.IN, title: 'Entrada', description: 'Aumenta stock en una sucursal.' },
                                    { value: TransactionType.OUT, title: 'Salida', description: 'Disminuye stock desde una sucursal.' },
                                    { value: TransactionType.TRANSFER, title: 'Transferencia', description: 'Mueve stock entre dos sucursales.' },
                                ] as const).map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => form.setValue('type', option.value, { shouldValidate: true })}
                                        className={`rounded-3xl border p-4 text-left transition ${watchedType === option.value
                                            ? 'border-slate-950 bg-slate-950 text-white'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="text-sm font-semibold">{option.title}</div>
                                        <div className={`mt-2 text-sm leading-6 ${watchedType === option.value ? 'text-slate-200' : 'text-slate-500'}`}>
                                            {option.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {form.formState.errors.type ? (
                                <p className="text-sm text-rose-600">{form.formState.errors.type.message}</p>
                            ) : null}
                        </div>
                    ) : null}

                    {step === 2 ? (
                        <div className="space-y-2">
                            <label htmlFor="transaction-product" className="text-sm font-medium text-slate-700">
                                Producto
                            </label>
                            <select
                                id="transaction-product"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                                {...form.register('productId')}
                            >
                                <option value="">Selecciona un producto</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}{product.SKU ? ` · ${product.SKU}` : ''}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.productId ? (
                                <p className="text-sm text-rose-600">{form.formState.errors.productId.message}</p>
                            ) : null}
                        </div>
                    ) : null}

                    {step === 3 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {(watchedType === TransactionType.OUT || watchedType === TransactionType.TRANSFER) ? (
                                <div className="space-y-2">
                                    <label htmlFor="transaction-from-store" className="text-sm font-medium text-slate-700">
                                        Sucursal origen
                                    </label>
                                    <select
                                        id="transaction-from-store"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                                        {...form.register('fromStoreId')}
                                    >
                                        <option value="">Selecciona una sucursal</option>
                                        {stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name} · {store.location}
                                            </option>
                                        ))}
                                    </select>
                                    {form.formState.errors.fromStoreId ? (
                                        <p className="text-sm text-rose-600">{form.formState.errors.fromStoreId.message}</p>
                                    ) : null}
                                </div>
                            ) : null}

                            {(watchedType === TransactionType.IN || watchedType === TransactionType.TRANSFER) ? (
                                <div className="space-y-2">
                                    <label htmlFor="transaction-to-store" className="text-sm font-medium text-slate-700">
                                        Sucursal destino
                                    </label>
                                    <select
                                        id="transaction-to-store"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                                        {...form.register('toStoreId')}
                                    >
                                        <option value="">Selecciona una sucursal</option>
                                        {stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name} · {store.location}
                                            </option>
                                        ))}
                                    </select>
                                    {form.formState.errors.toStoreId ? (
                                        <p className="text-sm text-rose-600">{form.formState.errors.toStoreId.message}</p>
                                    ) : null}
                                </div>
                            ) : null}

                            {watchedType !== TransactionType.IN && watchedFromStoreId && selectedProduct ? (
                                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                    Stock disponible en origen: <span className="font-semibold text-slate-950">{originStock}</span>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {step === 4 ? (
                        <div className="space-y-2">
                            <label htmlFor="transaction-quantity" className="text-sm font-medium text-slate-700">
                                Cantidad
                            </label>
                            <input
                                id="transaction-quantity"
                                type="number"
                                min="1"
                                step="1"
                                placeholder="1"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                                {...form.register('quantity', { valueAsNumber: true })}
                            />
                            {form.formState.errors.quantity ? (
                                <p className="text-sm text-rose-600">{form.formState.errors.quantity.message}</p>
                            ) : null}

                            {watchedType !== TransactionType.IN && watchedFromStoreId && selectedProduct && watchedQuantity > originStock ? (
                                <p className="text-sm text-rose-600">
                                    La cantidad supera el stock disponible en la sucursal origen.
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {step === 5 ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-base font-semibold text-slate-950">Resumen del movimiento</h3>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tipo</p>
                                    <p className="mt-2 font-medium text-slate-950">{movementLabel}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Producto</p>
                                    <p className="mt-2 font-medium text-slate-950">{selectedProduct?.name || 'Sin producto'}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Origen</p>
                                    <p className="mt-2 font-medium text-slate-950">{selectedFromStore?.name || 'No aplica'}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Destino</p>
                                    <p className="mt-2 font-medium text-slate-950">{selectedToStore?.name || 'No aplica'}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cantidad</p>
                                    <p className="mt-2 font-medium text-slate-950">{watchedQuantity}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={() => setStep((current) => Math.max(current - 1, 1))}
                            disabled={step === 1}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Anterior
                        </button>

                        {step < 5 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Siguiente
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? 'Guardando...' : 'Registrar movimiento'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}