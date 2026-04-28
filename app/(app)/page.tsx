import React from 'react';
import { DashboardFilters, DashboardOverview, DashboardPanels } from './ui/dashboard';
import { DashboardSearchParams } from '@/interfaces';
import { getDashboardInfo } from '@/actions/dashboard';
import { BarChart3, Sparkles } from 'lucide-react';

const DashboardPage = async ({ searchParams }: {
    searchParams: Promise<DashboardSearchParams>;
}) => {
    const params = await searchParams;
    const dashboard = await getDashboardInfo(params);

    if (!dashboard.ok) {
        return (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
                <p className="font-semibold">No fue posible cargar el dashboard</p>
                <p className="mt-2 text-sm">{dashboard.message}</p>
            </div>
        );
    }

    const { data } = dashboard;
    const fromDateLabel = data.filters.fromDate
        ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(data.filters.fromDate))
        : 'Sin fecha inicial';
    const toDateLabel = data.filters.toDate
        ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(data.filters.toDate))
        : 'Sin fecha final';

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(37,99,235,0.10),_transparent_45%)]" />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            Resumen operativo
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                                Dashboard de inventario y movimientos
                            </h1>
                            <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                                Monitorea transacciones, stock y sucursales con filtros por fecha, tienda y producto sin salir del flujo de servidor y cliente.
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-950 px-5 py-4 text-white shadow-sm">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                            <BarChart3 className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Ventana analizada</p>
                            <p className="text-sm font-semibold">
                                {fromDateLabel} - {toDateLabel}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <DashboardFilters filters={data.filters} options={data.options} />
            <DashboardOverview summary={data.summary} />
            <DashboardPanels
                recentTransactions={data.recentTransactions}
                topProducts={data.topProducts}
                topStores={data.topStores}
                lowStock={data.lowStock}
            />
        </div>
    );
};

export default DashboardPage;