import prisma from '@/lib/prisma';
import { categories, products, stores } from '@/data/fake-data';
import { createUpdateCategory } from '@/actions/category';
import { createUpdateStore } from '@/actions/store';
import { createUpdateProduct } from '@/actions/product';
import { createUpdateTransaction } from '@/actions/transaction';
import { NextResponse } from 'next/server';

type SeedResult = {
	categoriesCreated: number;
	storesCreated: number;
	productsCreated: number;
	transactionsCreated: number;
};

export async function POST() {
	try {
		const result: SeedResult = {
			categoriesCreated: 0,
			storesCreated: 0,
			productsCreated: 0,
			transactionsCreated: 0,
		};

		const existingCategories = await prisma.category.findMany({
			select: { id: true, name: true },
		});
		const existingStores = await prisma.store.findMany({
			select: { id: true, name: true },
		});
		const existingProducts = await prisma.product.findMany({
			select: { id: true, name: true },
		});

		const categoryByName = new Map(existingCategories.map((category) => [category.name, category]));
		const storeByName = new Map(existingStores.map((store) => [store.name, store]));
		const productByName = new Map(existingProducts.map((product) => [product.name, product]));

		for (const categoryName of categories) {
			if (!categoryByName.has(categoryName)) {
				const response = await createUpdateCategory({ name: categoryName });
				if (!response.ok) {
					return NextResponse.json(response, { status: 400 });
				}
				result.categoriesCreated += 1;
			}
		}

		for (const store of stores) {
			if (!storeByName.has(store.name)) {
				const response = await createUpdateStore(store);
				if (!response.ok) {
					return NextResponse.json(response, { status: 400 });
				}
				result.storesCreated += 1;
			}
		}

		const refreshedCategories = await prisma.category.findMany({
			select: { id: true, name: true },
		});
		const refreshedStores = await prisma.store.findMany({
			select: { id: true, name: true },
		});

		const categoryIdByName = new Map(refreshedCategories.map((category) => [category.name, category.id]));
		const storeIdByName = new Map(refreshedStores.map((store) => [store.name, store.id]));

		for (const product of products) {
			const categoryId = categoryIdByName.get(product.category);

			if (!categoryId) {
				return NextResponse.json(
					{
						ok: false,
						message: `No se encontró la categoría "${product.category}" para ${product.name}`,
					},
					{ status: 400 }
				);
			}

			if (!productByName.has(product.name)) {
				const storeList = refreshedStores.slice(0, 3).map((store, index) => ({
					storeId: store.id,
					quantity: (index + 1) * 25,
				}));

				const response = await createUpdateProduct({
					name: product.name,
					SKU: product.SKU,
					categoryId,
					price: 100,
					stocks: storeList,
				});

				if (!response.ok) {
					return NextResponse.json(response, { status: 400 });
				}

				result.productsCreated += 1;
			}
		}

		const seededProduct = await prisma.product.findFirst({
			where: { name: 'Laptop' },
			select: { id: true },
		});

		const centralStoreId = storeIdByName.get('Tienda Central');
		const northStoreId = storeIdByName.get('Sucursal Norte');

		if (seededProduct && centralStoreId && northStoreId) {
			const transactionResponse = await createUpdateTransaction({
				type: 'TRANSFER',
				productId: seededProduct.id,
				fromStoreId: centralStoreId,
				toStoreId: northStoreId,
				quantity: 5,
			});

			if (transactionResponse.ok) {
				result.transactionsCreated += 1;
			}
		}

		return NextResponse.json({
			ok: true,
			message: 'Datos falsos insertados correctamente',
			data: result,
		});
	} catch (error) {
		console.error('Error al insertar datos falsos:', error);
		return NextResponse.json(
			{
				ok: false,
				message: 'Error al insertar datos falsos',
			},
			{ status: 500 }
		);
	}
}
