import React from 'react';
import { DashboardInfo } from '@/interfaces';
import { ArrowRightLeft, AlertTriangle, Boxes, PackageSearch } from 'lucide-react';

interface Props {
    recentTransactions: DashboardInfo['recentTransactions'];
    topProducts: DashboardInfo['topProducts'];
    topStores: DashboardInfo['topStores'];
    lowStock: DashboardInfo['lowStock'];
}

const movementLabel: Record<string, string> = {
    IN: 'Entrada',
    OUT: 'Salida',
    TRANSFER: 'Transferencia',
    ADJUSTMENT: 'Ajuste',
};

export const DashboardPanels = ({ recentTransactions, topProducts, topStores, lowStock }: Props) => {
    return (
        <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 xl:col-span-2">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Actividad reciente</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-950">Últimos movimientos</h3>
                    </div>
                    <ArrowRightLeft className="h-5 w-5 text-slate-400" />
                </div>

                <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
                    <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        <span>Producto</span>
                        <span>Tipo</span>
                        <span>Sucursal</span>
                        <span className="text-right">Cantidad</span>
                    </div>

                    <div className="divide-y divide-slate-200">
                        {recentTransactions.length ? recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm text-slate-700">
                                <div>
                                    <p className="font-semibold text-slate-950">{transaction.productName}</p>
                                    <p className="text-xs text-slate-500">{transaction.productSku || 'Sin SKU'} · {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(transaction.timestamp)}</p>
                                </div>
                                <div>
                                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                        {movementLabel[transaction.type] || transaction.type}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-slate-500">
                                    <p>Desde: {transaction.fromStoreName || 'N/A'}</p>
                                    <p>Hacia: {transaction.toStoreName || 'N/A'}</p>
                                </div>
                                <p className="text-right text-base font-semibold text-slate-950">{transaction.quantity.toLocaleString('es-MX')}</p>
                            </div>
                        )) : (
                            <div className="px-4 py-10 text-center text-sm text-slate-500">
                                No hay transacciones para los filtros seleccionados.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-6 xl:col-span-1">
                <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                            <Boxes className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Inventario</p>
                            <h3 className="text-lg font-semibold text-slate-950">Productos con más unidades</h3>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {topProducts.length ? topProducts.map((product, index) => (
                            <div key={product.productId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-slate-950">{index + 1}. {product.name}</p>
                                        <p className="text-xs text-slate-500">{product.sku || 'Sin SKU'} · {product.locations} ubicaciones</p>
                                    </div>
                                    <p className="text-lg font-semibold text-slate-950">{product.totalUnits.toLocaleString('es-MX')}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                No hay inventario para este filtro.
                            </p>
                        )}
                    </div>
                </article>

                <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <PackageSearch className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Sucursales</p>
                            <h3 className="text-lg font-semibold text-slate-950">Más movimiento operativo</h3>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {topStores.length ? topStores.map((store, index) => (
                            <div key={store.storeId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-slate-950">{index + 1}. {store.name}</p>
                                        <p className="text-xs text-slate-500">{store.location} · {store.movements} movimientos</p>
                                    </div>
                                    <p className="text-lg font-semibold text-slate-950">{store.totalUnits.toLocaleString('es-MX')}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                No hay sucursales para este filtro.
                            </p>
                        )}
                    </div>
                </article>

                <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                            <AlertTriangle className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Alertas</p>
                            <h3 className="text-lg font-semibold text-slate-950">Stock bajo</h3>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {lowStock.length ? lowStock.map((item) => (
                            <div key={`${item.productId}-${item.storeId}`} className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                                <p className="font-semibold text-slate-950">{item.productName}</p>
                                <p className="text-xs text-slate-500">{item.productSku || 'Sin SKU'} · {item.storeName}</p>
                                <p className="mt-2 text-sm font-semibold text-rose-700">{item.quantity} unidades</p>
                            </div>
                        )) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                No hay alertas de stock bajo.
                            </p>
                        )}
                    </div>
                </article>
            </section>
        </div>
    );
};