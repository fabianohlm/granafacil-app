import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.HOUSING]: '#ef4444', // Red 500
  [Category.FOOD]: '#f97316', // Orange 500
  [Category.TRANSPORT]: '#eab308', // Yellow 500
  [Category.HEALTH]: '#10b981', // Emerald 500
  [Category.LEISURE]: '#06b6d4', // Cyan 500
  [Category.SHOPPING]: '#8b5cf6', // Violet 500
  [Category.SALARY]: '#22c55e', // Green 500
  [Category.INVESTMENT]: '#3b82f6', // Blue 500
  [Category.OTHER]: '#64748b', // Slate 500
};

export const INCOME_CATEGORIES = [
  Category.SALARY,
  Category.INVESTMENT,
  Category.OTHER
];

export const EXPENSE_CATEGORIES = [
  Category.HOUSING,
  Category.FOOD,
  Category.TRANSPORT,
  Category.HEALTH,
  Category.LEISURE,
  Category.SHOPPING,
  Category.OTHER
];

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
