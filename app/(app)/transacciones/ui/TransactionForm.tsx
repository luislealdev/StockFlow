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

const quantityPresets = [1, 5, 10, 25, 50];

const movementOptions = [
    { value: TransactionType.IN, title: 'Entrada', description: 'Aumenta stock en una sucursal.' },
    { value: TransactionType.OUT, title: 'Salida', description: 'Disminuye stock desde una sucursal.' },
    { value: TransactionType.TRANSFER, title: 'Transferencia', description: 'Mueve stock entre dos sucursales.' },
] as const;

export const TransactionForm = ({
    transaction,
    products,
    stores,
    onClose,
    onSaved,
}: Props) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [productSearch, setProductSearch] = React.useState('');

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

    const isEditing = Boolean(transaction?.id);
    const showWizard = !isEditing;

    const selectedProduct = products.find((product) => product.id === watchedProductId);
    const originStock = watchedFromStoreId
        ? selectedProduct?.stocks.find((stock) => stock.storeId === watchedFromStoreId)?.quantity ?? 0
        : 0;

    const movementLabel = watchedType === TransactionType.IN
        ? 'Entrada'
        : watchedType === TransactionType.OUT
            ? 'Salida'
            : 'Transferencia';

    const selectedFromStore = stores.find((store) => store.id === watchedFromStoreId);
    const selectedToStore = stores.find((store) => store.id === watchedToStoreId);
    const filteredProducts = React.useMemo(() => {
        const normalizedSearch = productSearch.trim().toLowerCase();

        if (!normalizedSearch) {
            return products;
        }

        return products.filter((product) => {
            const nameMatch = product.name.toLowerCase().includes(normalizedSearch);
            const skuMatch = product.SKU?.toLowerCase().includes(normalizedSearch) ?? false;

            return nameMatch || skuMatch;
        });
    }, [productSearch, products]);

    const selectedProductStockByStore = React.useMemo(() => {
        if (!selectedProduct) {
            return new Map<string, number>();
        }

        return new Map(selectedProduct.stocks.map((stock) => [stock.storeId, stock.quantity]));
    }, [selectedProduct]);

    React.useEffect(() => {
        form.reset({
            id: transaction?.id || undefined,
            type: transaction?.type || TransactionType.IN,
            productId: transaction?.productId || '',
            fromStoreId: transaction?.fromStoreId || undefined,
            toStoreId: transaction?.toStoreId || undefined,
            quantity: transaction?.quantity || 1,
        });
        setStep(1);
        setProductSearch('');
    }, [form, transaction]);

    React.useEffect(() => {
        if (showWizard && step === 2 && filteredProducts.length === 1 && !watchedProductId) {
            form.setValue('productId', filteredProducts[0].id, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [filteredProducts, form, showWizard, step, watchedProductId]);

    const handleNext = async () => {
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

        const valid = await form.trigger(currentStepFields[step]);
        if (valid) {
            setStep((current) => Math.min(current + 1, 5));
        }
    };

    const goToCreateStep = async (nextStep: number) => {
        if (!showWizard) {
            return;
        }

        if (nextStep <= 1) {
            setStep(1);
            return;
        }

        if (nextStep === 2) {
            const valid = await form.trigger(['type']);
            if (valid) setStep(2);
            return;
        }

        if (nextStep === 3) {
            const valid = await form.trigger(['productId']);
            if (valid) setStep(3);
            return;
        }

        if (nextStep === 4) {
            const valid = await form.trigger(
                watchedType === TransactionType.IN
                    ? ['toStoreId']
                    : watchedType === TransactionType.OUT
                        ? ['fromStoreId']
                        : ['fromStoreId', 'toStoreId']
            );
            if (valid) setStep(4);
            return;
        }

        if (nextStep === 5) {
            const valid = await form.trigger(['quantity']);
            if (valid) setStep(5);
        }
    };

    const selectType = async (value: TransactionType) => {
        form.setValue('type', value, { shouldValidate: true, shouldDirty: true });

        if (value === TransactionType.IN) {
            form.setValue('fromStoreId', undefined, { shouldValidate: true, shouldDirty: true });
        }

        if (value === TransactionType.OUT) {
            form.setValue('toStoreId', undefined, { shouldValidate: true, shouldDirty: true });
        }

        if (showWizard) {
            await goToCreateStep(2);
        }
    };

    const selectProduct = async (productId: string) => {
        form.setValue('productId', productId, { shouldValidate: true, shouldDirty: true });

        if (showWizard) {
            await goToCreateStep(3);
        }
    };

    const selectStore = async (field: 'fromStoreId' | 'toStoreId', storeId: string) => {
        form.setValue(field, storeId, { shouldValidate: true, shouldDirty: true });

        const nextFrom = field === 'fromStoreId' ? storeId : form.getValues('fromStoreId');
        const nextTo = field === 'toStoreId' ? storeId : form.getValues('toStoreId');

        if (showWizard) {
            const shouldAdvance = watchedType === TransactionType.IN
                ? Boolean(nextTo)
                : watchedType === TransactionType.OUT
                    ? Boolean(nextFrom)
                    : Boolean(nextFrom && nextTo);

            if (shouldAdvance) {
                await goToCreateStep(4);
            }
        }
    };

    const selectQuantity = async (value: number) => {
        form.setValue('quantity', value, { shouldValidate: true, shouldDirty: true });

        if (showWizard) {
            await goToCreateStep(5);
        }
    };

    const handleSubmit = async (data: z.TypeOf<typeof TransactionSchema>) => {
        setIsLoading(true);
        try {
            const normalizedData = {
                ...data,
                fromStoreId: data.fromStoreId || undefined,
                toStoreId: data.toStoreId || undefined,
            };

            const { ok, message } = await createUpdateTransaction(normalizedData);

            if (ok) {
                toast.success(message || `Movimiento ${data.id ? 'actualizado' : 'registrado'} correctamente`);
                onSaved?.();
                onClose();
                form.reset({
                    id: undefined,
                    type: TransactionType.IN,
                    productId: '',
                    fromStoreId: undefined,
                    toStoreId: undefined,
                    quantity: 1,
                });
                setStep(1);
                setProductSearch('');
            } else {
                toast.error(message || 'Error al guardar el movimiento');
            }
        } catch {
            toast.error('Error inesperado al guardar el movimiento');
        } finally {
            setIsLoading(false);
        }
    };

    const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (showWizard && step < 5) {
            await handleNext();
            return;
        }

        await form.handleSubmit(handleSubmit)(event);
    };

    const stepSections = {
        type: (
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-950">Tipo de transacción</h3>
                    <p className="text-sm text-slate-600">Primero define si será una entrada, salida o transferencia.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {movementOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => void selectType(option.value)}
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
        ),
        product: (
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-950">Producto</h3>
                    <p className="text-sm text-slate-600">Busca y selecciona el producto; al tocar una tarjeta avanzas automáticamente.</p>
                </div>

                <div className="relative">
                    <input
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key !== 'Enter') {
                                return;
                            }

                            event.preventDefault();

                            if (filteredProducts.length === 1) {
                                void selectProduct(filteredProducts[0].id);
                                return;
                            }

                            if (watchedProductId) {
                                void goToCreateStep(3);
                            }
                        }}
                        placeholder="Buscar por nombre o SKU"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => {
                        const stockTotal = product.stocks.reduce((total, stock) => total + stock.quantity, 0);
                        const isSelected = watchedProductId === product.id;

                        return (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => void selectProduct(product.id)}
                                className={`rounded-3xl border p-4 text-left transition ${isSelected
                                    ? 'border-slate-950 bg-slate-950 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold">{product.name}</p>
                                        <p className={`mt-1 text-xs ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                                            {product.SKU || 'Sin SKU'}
                                        </p>
                                    </div>
                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isSelected ? 'border-white/20 bg-white/10 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                                        {stockTotal} en stock
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                        No se encontraron productos con ese filtro.
                    </p>
                ) : null}

                {form.formState.errors.productId ? (
                    <p className="text-sm text-rose-600">{form.formState.errors.productId.message}</p>
                ) : null}
            </div>
        ),
        stores: (
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-950">Sucursales</h3>
                    <p className="text-sm text-slate-600">Selecciona origen y destino desde tarjetas visuales.</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {(watchedType === TransactionType.OUT || watchedType === TransactionType.TRANSFER) ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Origen</p>
                                <p className="mt-1 text-sm text-slate-600">Sucursal desde la que saldrá el stock.</p>
                            </div>

                            <div className="grid gap-3">
                                {stores.map((store) => {
                                    const stockHere = selectedProductStockByStore.get(store.id) ?? 0;
                                    const isSelected = watchedFromStoreId === store.id;

                                    return (
                                        <button
                                            key={`origin-${store.id}`}
                                            type="button"
                                            onClick={() => void selectStore('fromStoreId', store.id)}
                                            className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${isSelected
                                                ? 'border-slate-950 bg-slate-950 text-white'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">{store.name}</p>
                                                <p className={`mt-1 text-xs ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{store.location}</p>
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isSelected ? 'border-white/20 bg-white/10 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                                                {stockHere} disponibles
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {form.formState.errors.fromStoreId ? (
                                <p className="mt-3 text-sm text-rose-600">{form.formState.errors.fromStoreId.message}</p>
                            ) : null}
                        </div>
                    ) : null}

                    {(watchedType === TransactionType.IN || watchedType === TransactionType.TRANSFER) ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Destino</p>
                                <p className="mt-1 text-sm text-slate-600">Sucursal donde entrará el stock.</p>
                            </div>

                            <div className="grid gap-3">
                                {stores.map((store) => {
                                    const stockHere = selectedProductStockByStore.get(store.id) ?? 0;
                                    const isSelected = watchedToStoreId === store.id;

                                    return (
                                        <button
                                            key={`destination-${store.id}`}
                                            type="button"
                                            onClick={() => void selectStore('toStoreId', store.id)}
                                            className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${isSelected
                                                ? 'border-slate-950 bg-slate-950 text-white'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">{store.name}</p>
                                                <p className={`mt-1 text-xs ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{store.location}</p>
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isSelected ? 'border-white/20 bg-white/10 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                                                {stockHere} disponibles
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {form.formState.errors.toStoreId ? (
                                <p className="mt-3 text-sm text-rose-600">{form.formState.errors.toStoreId.message}</p>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {watchedType !== TransactionType.IN && watchedFromStoreId && selectedProduct ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        Stock disponible en origen: <span className="font-semibold text-slate-950">{originStock}</span>
                    </div>
                ) : null}
            </div>
        ),
        quantity: (
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-950">Cantidad</h3>
                    <p className="text-sm text-slate-600">Elige un valor rápido o escribe la cantidad manualmente.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {quantityPresets.map((value) => {
                        const isSelected = watchedQuantity === value;

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => void selectQuantity(value)}
                                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${isSelected
                                    ? 'border-slate-950 bg-slate-950 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {value}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2">
                    <label htmlFor="transaction-quantity" className="text-sm font-medium text-slate-700">
                        Cantidad personalizada
                    </label>
                    <input
                        id="transaction-quantity"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                        {...form.register('quantity', { valueAsNumber: true })}
                        onKeyDown={(event) => {
                            if (event.key !== 'Enter') {
                                return;
                            }

                            event.preventDefault();
                            void goToCreateStep(5);
                        }}
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
            </div>
        ),
        summary: (
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
        ),
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-[2px]"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className={`max-h-[92vh] w-full overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl shadow-slate-200/40 ${isEditing ? 'max-w-5xl' : 'max-w-4xl'}`}>
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

                {showWizard ? (
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
                ) : null}

                <form onSubmit={onFormSubmit} className="space-y-6">
                    <input type="hidden" {...form.register('id')} />
                    <input type="hidden" {...form.register('type')} />
                    <input type="hidden" {...form.register('productId')} />
                    <input type="hidden" {...form.register('fromStoreId')} />
                    <input type="hidden" {...form.register('toStoreId')} />

                    {showWizard ? (
                        <>
                            {step === 1 ? stepSections.type : null}
                            {step === 2 ? stepSections.product : null}
                            {step === 3 ? stepSections.stores : null}
                            {step === 4 ? stepSections.quantity : null}
                            {step === 5 ? stepSections.summary : null}
                        </>
                    ) : (
                        <div className="space-y-6">
                            {stepSections.type}
                            {stepSections.product}
                            {stepSections.stores}
                            {stepSections.quantity}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        {showWizard ? (
                            <button
                                type="button"
                                onClick={() => setStep((current) => Math.max(current - 1, 1))}
                                disabled={step === 1}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Anterior
                            </button>
                        ) : (
                            <span className="text-sm text-slate-500">Edita cualquier campo y guarda cuando termines.</span>
                        )}

                        {showWizard ? (
                            step < 5 ? (
                                <button
                                    type="button"
                                    onClick={() => void handleNext()}
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
                            )
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}