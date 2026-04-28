import { DatePreset } from './pagination.interface';

export interface DashboardSearchParams {
    search?: string;
    datePreset?: DatePreset;
    fromDate?: string | null;
    toDate?: string | null;
    storeId?: string;
    productId?: string;
}

export interface DashboardFilterOption {
    id: string;
    label: string;
    meta?: string;
}

export interface DashboardSummaryMetrics {
    transactions: number;
    inbound: number;
    outbound: number;
    transfers: number;
    adjustments: number;
    totalProducts: number;
    totalStores: number;
    totalCategories: number;
    totalUnits: number;
    lowStockItems: number;
}

export interface DashboardTopProduct {
    productId: string;
    name: string;
    sku: string | null;
    totalUnits: number;
    locations: number;
}

export interface DashboardTopStore {
    storeId: string;
    name: string;
    location: string;
    totalUnits: number;
    movements: number;
}

export interface DashboardTransactionItem {
    id: string;
    type: string;
    quantity: number;
    timestamp: Date;
    productId: string;
    productName: string;
    productSku: string | null;
    fromStoreId: string | null;
    fromStoreName: string | null;
    toStoreId: string | null;
    toStoreName: string | null;
}

export interface DashboardLowStockItem {
    productId: string;
    productName: string;
    productSku: string | null;
    storeId: string;
    storeName: string;
    quantity: number;
}

export interface DashboardFilterOptions {
    products: DashboardFilterOption[];
    stores: DashboardFilterOption[];
}

export interface DashboardInfo {
    filters: {
        search: string;
        datePreset: DatePreset;
        fromDate: string | null;
        toDate: string | null;
        storeId: string;
        productId: string;
    };
    summary: DashboardSummaryMetrics;
    topProducts: DashboardTopProduct[];
    topStores: DashboardTopStore[];
    recentTransactions: DashboardTransactionItem[];
    lowStock: DashboardLowStockItem[];
    options: DashboardFilterOptions;
}