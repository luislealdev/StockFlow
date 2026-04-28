'use client';

import React from 'react';
import { DashboardFilterOptions, DashboardSearchParams } from '@/interfaces';
import { DatePreset } from '@/interfaces/pagination.interface';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
    filters: DashboardSearchParams;
    options: DashboardFilterOptions;
}

const datePresets: Array<{ value: DatePreset; label: string }> = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Últimos 7 días' },
    { value: 'month', label: 'Últimos 30 días' },
    { value: 'custom', label: 'Rango personalizado' },
];

export const DashboardFilters = ({ filters, options }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams(searchParams.toString());

        const search = String(formData.get('search') || '').trim();
        const datePreset = String(formData.get('datePreset') || 'month') as DatePreset;
        const fromDate = String(formData.get('fromDate') || '').trim();
        const toDate = String(formData.get('toDate') || '').trim();
        const storeId = String(formData.get('storeId') || '').trim();
        const productId = String(formData.get('productId') || '').trim();

        if (search) params.set('search', search); else params.delete('search');
        if (datePreset) params.set('datePreset', datePreset); else params.delete('datePreset');
        if (fromDate && datePreset === 'custom') params.set('fromDate', fromDate); else params.delete('fromDate');
        if (toDate && datePreset === 'custom') params.set('toDate', toDate); else params.delete('toDate');
        if (storeId) params.set('storeId', storeId); else params.delete('storeId');
        if (productId) params.set('productId', productId); else params.delete('productId');

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push(pathname);
    };

    const showCustomDates = (filters.datePreset || 'month') === 'custom';

    return (
        <form onSubmit={onSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Filter className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Filtros</p>
                        <h2 className="text-lg font-semibold text-slate-950">Delimita el análisis</h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                    <RotateCcw className="h-4 w-4" />
                    Limpiar filtros
                </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
                <label className="space-y-2 xl:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</span>
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            name="search"
                            defaultValue={filters.search || ''}
                            placeholder="Producto, SKU, sucursal o ubicación"
                            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>
                </label>

                <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Periodo</span>
                    <select
                        name="datePreset"
                        defaultValue={filters.datePreset || 'month'}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        {datePresets.map((preset) => (
                            <option key={preset.value} value={preset.value}>{preset.label}</option>
                        ))}
                    </select>
                </label>

                <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sucursal</span>
                    <select
                        name="storeId"
                        defaultValue={filters.storeId || ''}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        <option value="">Todas</option>
                        {options.stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Producto</span>
                    <select
                        name="productId"
                        defaultValue={filters.productId || ''}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        <option value="">Todos</option>
                        {options.products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {showCustomDates ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <label className="space-y-2 xl:col-start-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Desde</span>
                        <input
                            type="date"
                            name="fromDate"
                            defaultValue={filters.fromDate ? filters.fromDate.slice(0, 10) : ''}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Hasta</span>
                        <input
                            type="date"
                            name="toDate"
                            defaultValue={filters.toDate ? filters.toDate.slice(0, 10) : ''}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                        />
                    </label>
                </div>
            ) : null}

            <div className="mt-5 flex justify-end">
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    Aplicar filtros
                </button>
            </div>
        </form>
    );
};