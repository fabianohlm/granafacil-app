import Dexie, { type Table } from 'dexie';
import { Transaction, Goal } from '../types';

export class FinanceAppDB extends Dexie {
  transactions!: Table<Transaction>;
  goals!: Table<Goal>;

  constructor() {
    super('FinanceAppDB');
    (this as any).version(1).stores({
      transactions: '++id, type, date, category, installmentGroupId',
      goals: '++id'
    });
  }
}

export const db = new FinanceAppDB();