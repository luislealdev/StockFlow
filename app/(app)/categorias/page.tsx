import { getPaginatedCategories } from "@/actions/category";
import { ISearchParams } from "@/interfaces";
import { CategoriesTable } from "./ui/CategoriesTable";

const EmployeesPage = async ({ searchParams }: {
    searchParams: Promise<ISearchParams>;
}) => {

    const { page, take, search } = await searchParams;

    const { data, total, totalPages } = await getPaginatedCategories({
        page: page ? parseInt(page) : 1,
        take: take ? parseInt(take) : 20,
        search: search || '',
    })

    return (
        <CategoriesTable
            data={data || []}
            total={total || 0}
            totalPages={totalPages || 0}
            page={page ? parseInt(page) : 1}
            take={take ? parseInt(take) : 20}
            search={search || ''}
        />
    )
}

export default EmployeesPage;
