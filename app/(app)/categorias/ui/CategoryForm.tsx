import { createUpdateCategory } from '@/actions/category';
import { CategorySchema } from '@/schemas';
import { Category } from '@prisma/client'
import React from 'react'
import { toast } from 'sonner';
import z from 'zod';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
    category: Category | null;
}

export const CategoryForm = ({
    category
}: Props) => {

    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof CategorySchema>>({
        resolver: zodResolver(CategorySchema),
        defaultValues: {
            id: category?.id || undefined,
            name: category?.name || '',
        },
    });

    const handleSubmit = async (data: z.infer<typeof CategorySchema>) => {
        setIsLoading(true);
        try {
            const { ok, message } = await createUpdateCategory(data);

            if (ok) {
                toast.success(message || `Categoría ${data.id ? 'actualizada' : 'creada'} correctamente`);
            } else {
                toast.error(message || 'Error al guardar la categoría');
            }
        } catch {
            toast.error('Error inesperado al guardar la categoría');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>CategoryForm</div>
    )
}
