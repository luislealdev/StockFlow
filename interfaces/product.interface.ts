import { Stock, Product } from '@prisma/client';

export interface IProductExtended extends Product{
    stocks: Stock[]
}