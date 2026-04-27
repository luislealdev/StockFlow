import { PaginatedComponentProps } from '@/interfaces'
import { Category } from '@prisma/client'
import React from 'react'

export const CategoriesTable = ({
    data,
    page,
    take,
    search,
    total,
    totalPages
}: PaginatedComponentProps<Category>) => {
    return (
        <div>CategoriesTable</div>
    )
}
