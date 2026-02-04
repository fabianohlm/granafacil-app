
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Category {
  HOUSING = 'Habitação',
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HEALTH = 'Saúde',
  LEISURE = 'Lazer',
  SHOPPING = 'Compras',
  SALARY = 'Salário',
  INVESTMENT = 'Investimento',
  OTHER = 'Outros'
}

export interface Transaction {
  id?: number; // Changed to optional number for IndexedDB auto-increment
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO Date string YYYY-MM-DD
  
  // Installment specific logic
  isInstallment: boolean;
  installmentGroupId?: string; // ID linking all installments of same purchase
  currentInstallment?: number;
  totalInstallments?: number;
  
  // Fixed expense logic
  isFixed: boolean; 
  originalId?: string; // Links recurring items
}

export interface Goal {
  id?: number; // Changed to optional number
  name: string;
  target: number;
  saved: number;
  emoji?: string;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
  pendingInstallmentsTotal: number; // Future debt
}

export interface FinancialAdvice {
  content: string;
  timestamp: number;
}
