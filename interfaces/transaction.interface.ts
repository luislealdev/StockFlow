import { Product, Store, Transaction } from "@prisma/client";

export interface ITransactionExtended extends Transaction {
    product: Product;
    fromStore?: Store | null;
    toStore?: Store | null;
}