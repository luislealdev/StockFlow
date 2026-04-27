import { getPaginatedProducts } from '@/actions/product';
import { ISearchParams } from '@/interfaces';
import { ProductsTable } from './ui/ProductsTable';
import { getPaginatedCategories } from '@/actions/category';
import { getPaginatedStores } from '@/actions/store';

const ProductsPage = async ({ searchParams }: {
    searchParams: Promise<ISearchParams>;
}) => {
    const { page, take, search } = await searchParams;

    const [productsResult, categoriesResult, storesResult] = await Promise.all([
        getPaginatedProducts({
            page: page ? parseInt(page) : 1,
            take: take ? parseInt(take) : 20,
            search: search || '',
        }),
        getPaginatedCategories({
            page: 1,
            take: 5, // Obtener solo algunas categorías
        }),
        // Aquí podrías agregar una función similar para obtener las tiendas si es necesario
        getPaginatedStores({
            page: 1,
            take: 5, // Obtener algunas tiendas
        }),
    ]);

    return (
        <ProductsTable
            data={productsResult.data || []}
            total={productsResult.total || 0}
            totalPages={productsResult.totalPages || 0}
            page={page ? parseInt(page) : 1}
            take={take ? parseInt(take) : 20}
            search={search || ''}
            categories={categoriesResult.data || []}
            stores={storesResult.data || []}
        />
    );
};

export default ProductsPage;

