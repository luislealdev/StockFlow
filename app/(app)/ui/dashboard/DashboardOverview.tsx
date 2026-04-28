import React from 'react';
import { DashboardInfo } from '@/interfaces';
import { ArrowDownRight, ArrowUpRight, Clock3, Package2, ScanSearch, Store, Truck } from 'lucide-react';

interface Props {
    summary: DashboardInfo['summary'];
}

const summaryCards = [
    {
        key: 'transactions',
        label: 'Movimientos en rango',
        icon: ScanSearch,
        tone: 'bg-slate-950 text-white',
    },
    {
        key: 'inbound',
        label: 'Entradas',
        icon: ArrowUpRight,
        tone: 'bg-emerald-50 text-emerald-700',
    },
    {
        key: 'outbound',
        label: 'Salidas',
        icon: ArrowDownRight,
        tone: 'bg-rose-50 text-rose-700',
    },
    {
        key: 'transfers',
        label: 'Transferencias',
        icon: Truck,
        tone: 'bg-blue-50 text-blue-700',
    },
    {
        key: 'totalUnits',
        label: 'Unidades en inventario',
        icon: Package2,
        tone: 'bg-amber-50 text-amber-700',
    },
    {
        key: 'lowStockItems',
        label: 'Alertas de stock bajo',
        icon: Clock3,
        tone: 'bg-violet-50 text-violet-700',
    },
] as const;

export const DashboardOverview = ({ summary }: Props) => {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                    <article key={card.key} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                                    {card.label}
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                    {summary[card.key].toLocaleString('es-MX')}
                                </p>
                            </div>

                            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
                                <Icon className="h-5 w-5" />
                            </span>
                        </div>
                    </article>
                );
            })}

            <article className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm shadow-slate-200/50 md:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <Store className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                            Contexto operativo
                        </p>
                        <p className="mt-1 text-lg font-semibold">Resumen general del negocio</p>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Productos</p>
                        <p className="mt-2 text-2xl font-semibold">{summary.totalProducts.toLocaleString('es-MX')}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sucursales</p>
                        <p className="mt-2 text-2xl font-semibold">{summary.totalStores.toLocaleString('es-MX')}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 sm:col-span-2">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Categorías registradas</p>
                        <p className="mt-2 text-2xl font-semibold">{summary.totalCategories.toLocaleString('es-MX')}</p>
                    </div>
                </div>
            </article>
        </section>
    );
};