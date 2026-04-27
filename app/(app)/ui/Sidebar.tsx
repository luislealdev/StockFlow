"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Boxes,
    ClipboardList,
    Layers3,
    MoveRight,
    ShoppingBag,
    Store,
} from 'lucide-react';

export const Sidebar = () => {
    const pathname = usePathname();

    const navigation = [
        { href: '/', label: 'Dashboard', description: 'Resumen general', icon: BarChart3 },
        { href: '/categorias', label: 'Categorías', description: 'Clasificación de inventario', icon: Layers3 },
        { href: '/productos', label: 'Productos', description: 'Catálogo principal', icon: ShoppingBag },
        { href: '/tiendas', label: 'Tiendas', description: 'Sucursales y ubicaciones', icon: Store },
        { href: '/transacciones', label: 'Transacciones', description: 'Movimientos y auditoría', icon: ClipboardList },
    ];

    return (
        <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-72 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col px-4 py-5 sm:px-6 lg:px-5 lg:py-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-slate-200/40">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                            <Boxes className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                                StockFlow
                            </p>
                            <h1 className="text-lg font-semibold text-slate-950">
                                Operations Hub
                            </h1>
                        </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Controla inventario, catálogos y movimientos desde una interfaz limpia y directa.
                    </p>
                </div>

                <nav className="mt-6 flex-1 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${isActive
                                    ? 'border-slate-200 bg-slate-50 text-slate-950 shadow-sm'
                                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
                                    }`}
                            >
                                <span className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-900'}`}>
                                    <Icon className="h-4 w-4" />
                                </span>

                                <span className="flex-1">
                                    <span className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold">{item.label}</span>
                                        {isActive ? <MoveRight className="h-4 w-4 text-blue-600" /> : null}
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        {item.description}
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm shadow-slate-300/30">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                        Estado del sistema
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Tu panel está listo para administrar el flujo operativo sin ruido visual.
                    </p>
                </div>
            </div>
        </aside>
    )
}
