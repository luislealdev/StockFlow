import { getPaginatedStores } from '@/actions/store';
import { ISearchParams } from '@/interfaces';
import { StoresTable } from './ui/StoresTable';

const StoresPage = async ({ searchParams }: {
    searchParams: Promise<ISearchParams>;
}) => {
    const { page, take, search } = await searchParams;

    const { data, total, totalPages } = await getPaginatedStores({
        page: page ? parseInt(page) : 1,
        take: take ? parseInt(take) : 20,
        search: search || '',
    });

    return (
        <StoresTable
            data={data || []}
            total={total || 0}
            totalPages={totalPages || 0}
            page={page ? parseInt(page) : 1}
            take={take ? parseInt(take) : 20}
            search={search || ''}
        />
    );
};

export default StoresPage