

export type DatePreset = 'today' | 'week' | 'month' | 'custom';

export interface PaginationProps {
    page: number;
    take?: number;
    search?: string;
}

export interface ISearchParams {
    page?: string;
    take?: string;
    search?: string;
    categoryId?: string;
}

export interface PaginatedComponentProps<T> {
    data: T[];
    total: number;
    totalPages: number;
    page: number;
    take: number;
    search: string;
}