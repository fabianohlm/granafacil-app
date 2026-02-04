
import { db } from '../database/db';
import { Transaction, Goal } from '../types';

// TRANSACTIONS
export const getTransactions = async (): Promise<Transaction[]> => {
  return await db.transactions.toArray();
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
  await db.transactions.add(transaction);
};

export const addTransactionsBatch = async (newTransactions: Transaction[]): Promise<void> => {
  await db.transactions.bulkAdd(newTransactions);
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await db.transactions.delete(id);
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  // Find all keys that match the groupId
  const transactionsToDelete = await db.transactions
    .where('installmentGroupId')
    .equals(groupId)
    .toArray();
  
  const ids = transactionsToDelete.map(t => t.id as number);
  await db.transactions.bulkDelete(ids);
}

// GOALS
export const getGoals = async (): Promise<Goal[]> => {
  const goals = await db.goals.toArray();
  
  // Initialize defaults if empty
  if (goals.length === 0) {
    const defaults: Goal[] = [
      { name: "Reserva de Emergência", target: 5000, saved: 1000, emoji: '🛡️' },
      { name: "Viagem Férias", target: 3000, saved: 450, emoji: '✈️' }
    ];
    await db.goals.bulkAdd(defaults);
    return await db.goals.toArray();
  }
  
  return goals;
};

export const updateGoal = async (goalId: number, addedAmount: number): Promise<void> => {
  const goal = await db.goals.get(goalId);
  if (goal) {
    await db.goals.update(goalId, { saved: goal.saved + addedAmount });
  }
};
