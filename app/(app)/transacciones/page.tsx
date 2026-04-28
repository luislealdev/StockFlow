import { getPaginatedTransactions } from '@/actions/transaction';
import { ISearchParams } from '@/interfaces';
import { TransactionsTable } from './ui/TransactionsTable';
import { getPaginatedProducts } from '@/actions/product';
import { getPaginatedStores } from '@/actions/store';

const TransactionsPage = async ({ searchParams }: {
    searchParams: Promise<ISearchParams>;
}) => {
    const { page, take, search } = await searchParams;

    const [transactionsResult, productsResult, storesResult] = await Promise.all([
        getPaginatedTransactions({
            page: page ? parseInt(page) : 1,
            take: take ? parseInt(take) : 20,
            search: search || '',
        }),
        getPaginatedProducts({
            page: 1,
            take: 100, // Obtener más productos para el filtro
        }),
        getPaginatedStores({
            page: 1,
            take: 100, // Obtener más tiendas para el filtro
        }),
    ]);

    return (
        <TransactionsTable
            data={transactionsResult.data || []}
            total={transactionsResult.total || 0}
            totalPages={transactionsResult.totalPages || 0}
            page={page ? parseInt(page) : 1}
            take={take ? parseInt(take) : 20}
            search={search || ''}
            products={productsResult.data || []}
            stores={storesResult.data || []}
        />
    );
};

export default TransactionsPage;