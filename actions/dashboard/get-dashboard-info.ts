'use server';

import prisma from '@/lib/prisma';
import { DashboardInfo, DashboardSearchParams } from '@/interfaces';
import { DatePreset } from '@/interfaces/pagination.interface';
import { Prisma, TransactionType } from '@prisma/client';

const LOW_STOCK_THRESHOLD = 5;

function normalizeDate(dateString?: string | null) {
	if (!dateString) {
		return null;
	}

	const parsedDate = new Date(dateString);

	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function resolveDateRange(filters: DashboardSearchParams) {
	const preset = filters.datePreset || 'month';
	const now = new Date();
	const end = new Date(now);
	end.setHours(23, 59, 59, 999);

	const start = new Date(now);
	start.setHours(0, 0, 0, 0);

	if (preset === 'today') {
		return {
			datePreset: preset,
			fromDate: start,
			toDate: end,
		};
	}

	if (preset === 'week') {
		const day = start.getDay();
		const offset = day === 0 ? 6 : day - 1;
		start.setDate(start.getDate() - offset);
		return {
			datePreset: preset,
			fromDate: start,
			toDate: end,
		};
	}

	if (preset === 'custom') {
		const customStart = normalizeDate(filters.fromDate) || start;
		const customEnd = normalizeDate(filters.toDate) || end;

		customStart.setHours(0, 0, 0, 0);
		customEnd.setHours(23, 59, 59, 999);

		return {
			datePreset: preset,
			fromDate: customStart,
			toDate: customEnd,
		};
	}

	start.setDate(start.getDate() - 29);

	return {
		datePreset: preset as DatePreset,
		fromDate: start,
		toDate: end,
	};
}

export async function getDashboardInfo(filters: DashboardSearchParams = {}): Promise<{ ok: true; data: DashboardInfo } | { ok: false; message: string }> {
	try {
		const search = filters.search?.trim() || '';
		const storeId = filters.storeId?.trim() || '';
		const productId = filters.productId?.trim() || '';
		const range = resolveDateRange(filters);

		const [categoriesCount, productsCount, storesCount, products, stores] = await Promise.all([
			prisma.category.count(),
			prisma.product.count(),
			prisma.store.count(),
			prisma.product.findMany({
				orderBy: { name: 'asc' },
				select: { id: true, name: true, SKU: true },
			}),
			prisma.store.findMany({
				orderBy: { name: 'asc' },
				select: { id: true, name: true, location: true },
			}),
		]);

		const matchedProductIds = search
			? (await prisma.product.findMany({
				where: {
					OR: [
						{ name: { contains: search, mode: 'insensitive' } },
						{ SKU: { contains: search, mode: 'insensitive' } },
					],
				},
				select: { id: true },
			})).map((item) => item.id)
			: [];

		const matchedStoreIds = search
			? (await prisma.store.findMany({
				where: {
					OR: [
						{ name: { contains: search, mode: 'insensitive' } },
						{ location: { contains: search, mode: 'insensitive' } },
					],
				},
				select: { id: true },
			})).map((item) => item.id)
			: [];

		const transactionAnd: Prisma.TransactionWhereInput[] = [
			{
				timestamp: {
					gte: range.fromDate,
					lte: range.toDate,
				},
			},
		];

		if (productId) {
			transactionAnd.push({ productId });
		}

		if (storeId) {
			transactionAnd.push({
				OR: [
					{ fromStoreId: storeId },
					{ toStoreId: storeId },
				],
			});
		}

		if (search) {
			const searchOr: Prisma.TransactionWhereInput[] = [];

			if (matchedProductIds.length) {
				searchOr.push({ productId: { in: matchedProductIds } });
			}

			if (matchedStoreIds.length) {
				searchOr.push({ fromStoreId: { in: matchedStoreIds } });
				searchOr.push({ toStoreId: { in: matchedStoreIds } });
			}

			transactionAnd.push(
				searchOr.length
					? { OR: searchOr }
					: { id: { in: [] } }
			);
		}

		const transactionWhere: Prisma.TransactionWhereInput = { AND: transactionAnd };

		const stockAnd: Prisma.StockWhereInput[] = [];

		if (productId) {
			stockAnd.push({ productId });
		}

		if (storeId) {
			stockAnd.push({ storeId });
		}

		if (search) {
			const searchStockOr: Prisma.StockWhereInput[] = [];

			if (matchedProductIds.length) {
				searchStockOr.push({ productId: { in: matchedProductIds } });
			}

			if (matchedStoreIds.length) {
				searchStockOr.push({ storeId: { in: matchedStoreIds } });
			}

			stockAnd.push(
				searchStockOr.length
					? { OR: searchStockOr }
					: { id: { in: [] } }
			);
		}

		const stockWhere: Prisma.StockWhereInput = stockAnd.length ? { AND: stockAnd } : {};

		const [transactions, stocks, transactionCount, inboundCount, outboundCount, transferCount, adjustmentCount] = await Promise.all([
			prisma.transaction.findMany({
				where: transactionWhere,
				orderBy: { timestamp: 'desc' },
				take: 10,
				select: {
					id: true,
					type: true,
					quantity: true,
					timestamp: true,
					productId: true,
					fromStoreId: true,
					toStoreId: true,
				},
			}),
			prisma.stock.findMany({
				where: stockWhere,
				select: {
					productId: true,
					storeId: true,
					quantity: true,
				},
			}),
			prisma.transaction.count({ where: transactionWhere }),
			prisma.transaction.count({ where: { AND: [...transactionAnd, { type: TransactionType.IN }] } }),
			prisma.transaction.count({ where: { AND: [...transactionAnd, { type: TransactionType.OUT }] } }),
			prisma.transaction.count({ where: { AND: [...transactionAnd, { type: TransactionType.TRANSFER }] } }),
			prisma.transaction.count({ where: { AND: [...transactionAnd, { type: TransactionType.ADJUSTMENT }] } }),
		]);

		const productIds = new Set<string>([
			...transactions.map((item) => item.productId),
			...stocks.map((item) => item.productId),
		]);

		const storeIds = new Set<string>([
			...transactions.flatMap((item) => [item.fromStoreId, item.toStoreId].filter(Boolean) as string[]),
			...stocks.map((item) => item.storeId),
		]);

		const [productMeta, storeMeta] = await Promise.all([
			productIds.size
				? prisma.product.findMany({
					where: { id: { in: [...productIds] } },
					select: { id: true, name: true, SKU: true },
				})
				: Promise.resolve([]),
			storeIds.size
				? prisma.store.findMany({
					where: { id: { in: [...storeIds] } },
					select: { id: true, name: true, location: true },
				})
				: Promise.resolve([]),
		]);

		const productMap = new Map(productMeta.map((item) => [item.id, item]));
		const storeMap = new Map(storeMeta.map((item) => [item.id, item]));

		const recentTransactions = transactions.map((transaction) => {
			const product = productMap.get(transaction.productId);
			const fromStore = transaction.fromStoreId ? storeMap.get(transaction.fromStoreId) : null;
			const toStore = transaction.toStoreId ? storeMap.get(transaction.toStoreId) : null;

			return {
				id: transaction.id,
				type: transaction.type,
				quantity: transaction.quantity,
				timestamp: transaction.timestamp,
				productId: transaction.productId,
				productName: product?.name || 'Producto eliminado',
				productSku: product?.SKU || null,
				fromStoreId: transaction.fromStoreId,
				fromStoreName: fromStore?.name || null,
				toStoreId: transaction.toStoreId,
				toStoreName: toStore?.name || null,
			};
		});

		const stockByProduct = new Map<string, { totalUnits: number; locations: Set<string> }>();
		const stockByStore = new Map<string, { totalUnits: number; movements: number }>();
		let lowStockItems = 0;

		for (const stock of stocks) {
			const productEntry = stockByProduct.get(stock.productId) || {
				totalUnits: 0,
				locations: new Set<string>(),
			};

			productEntry.totalUnits += stock.quantity;
			productEntry.locations.add(stock.storeId);
			stockByProduct.set(stock.productId, productEntry);

			const storeEntry = stockByStore.get(stock.storeId) || {
				totalUnits: 0,
				movements: 0,
			};

			storeEntry.totalUnits += stock.quantity;
			stockByStore.set(stock.storeId, storeEntry);

			if (stock.quantity <= LOW_STOCK_THRESHOLD) {
				lowStockItems += 1;
			}
		}

		for (const transaction of transactions) {
			if (transaction.fromStoreId) {
				const entry = stockByStore.get(transaction.fromStoreId) || { totalUnits: 0, movements: 0 };
				entry.movements += 1;
				stockByStore.set(transaction.fromStoreId, entry);
			}

			if (transaction.toStoreId && transaction.toStoreId !== transaction.fromStoreId) {
				const entry = stockByStore.get(transaction.toStoreId) || { totalUnits: 0, movements: 0 };
				entry.movements += 1;
				stockByStore.set(transaction.toStoreId, entry);
			}
		}

		const topProducts = [...stockByProduct.entries()]
			.map(([productId, entry]) => {
				const meta = productMap.get(productId);

				return {
					productId,
					name: meta?.name || 'Producto eliminado',
					sku: meta?.SKU || null,
					totalUnits: entry.totalUnits,
					locations: entry.locations.size,
				};
			})
			.sort((left, right) => right.totalUnits - left.totalUnits)
			.slice(0, 6);

		const topStores = [...stockByStore.entries()]
			.map(([storeId, entry]) => {
				const meta = storeMap.get(storeId);

				return {
					storeId,
					name: meta?.name || 'Sucursal eliminada',
					location: meta?.location || '-',
					totalUnits: entry.totalUnits,
					movements: entry.movements,
				};
			})
			.sort((left, right) => right.movements - left.movements)
			.slice(0, 6);

		const summary: DashboardInfo['summary'] = {
			transactions: transactionCount,
			inbound: inboundCount,
			outbound: outboundCount,
			transfers: transferCount,
			adjustments: adjustmentCount,
			totalProducts: productId ? 1 : productsCount,
			totalStores: storeId ? 1 : storesCount,
			totalCategories: categoriesCount,
			totalUnits: stocks.reduce((total, item) => total + item.quantity, 0),
			lowStockItems,
		};

		return {
			ok: true,
			data: {
				filters: {
					search,
					datePreset: range.datePreset,
					fromDate: range.fromDate.toISOString(),
					toDate: range.toDate.toISOString(),
					storeId,
					productId,
				},
				summary,
				topProducts,
				topStores,
				recentTransactions,
				lowStock: stocks
					.filter((item) => item.quantity <= LOW_STOCK_THRESHOLD)
					.map((item) => {
						const product = productMap.get(item.productId);
						const store = storeMap.get(item.storeId);

						return {
							productId: item.productId,
							productName: product?.name || 'Producto eliminado',
							productSku: product?.SKU || null,
							storeId: item.storeId,
							storeName: store?.name || 'Sucursal eliminada',
							quantity: item.quantity,
						};
					}),
				options: {
					products: products.map((product) => ({
						id: product.id,
						label: product.SKU ? `${product.name} · ${product.SKU}` : product.name,
						meta: product.SKU || undefined,
					})),
					stores: stores.map((store) => ({
						id: store.id,
						label: store.name,
						meta: store.location,
					})),
				},
			},
		};
	} catch (error) {
		console.error('Error al obtener información del dashboard:', error);

		return {
			ok: false,
			message: 'Error al obtener información del dashboard',
		};
	}
}