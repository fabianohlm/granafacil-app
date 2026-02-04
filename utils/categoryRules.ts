import { Category } from '../types';

export const categoryRules: Record<string, Category> = {
  // Alimentação
  'mercado': Category.FOOD,
  'supermercado': Category.FOOD,
  'ifood': Category.FOOD,
  'restaurante': Category.FOOD,
  'lanchonete': Category.FOOD,
  'padaria': Category.FOOD,
  'pizza': Category.FOOD,
  'burguer': Category.FOOD,
  'açaí': Category.FOOD,
  'bar': Category.FOOD,

  // Transporte
  'uber': Category.TRANSPORT,
  '99': Category.TRANSPORT,
  'gasolina': Category.TRANSPORT,
  'posto': Category.TRANSPORT,
  'estacionamento': Category.TRANSPORT,
  'pedágio': Category.TRANSPORT,
  'ônibus': Category.TRANSPORT,
  'metrô': Category.TRANSPORT,
  'mecânico': Category.TRANSPORT,

  // Habitação
  'luz': Category.HOUSING,
  'energia': Category.HOUSING,
  'água': Category.HOUSING,
  'aluguel': Category.HOUSING,
  'condomínio': Category.HOUSING,
  'internet': Category.HOUSING,
  'net': Category.HOUSING,
  'vivo': Category.HOUSING,
  'claro': Category.HOUSING,
  'gás': Category.HOUSING,

  // Saúde
  'farmácia': Category.HEALTH,
  'drogaria': Category.HEALTH,
  'médico': Category.HEALTH,
  'exame': Category.HEALTH,
  'dentista': Category.HEALTH,
  'hospital': Category.HEALTH,
  'plano': Category.HEALTH,
  'academia': Category.HEALTH,

  // Lazer
  'netflix': Category.LEISURE,
  'spotify': Category.LEISURE,
  'prime': Category.LEISURE,
  'cinema': Category.LEISURE,
  'jogo': Category.LEISURE,
  'steam': Category.LEISURE,
  'viagem': Category.LEISURE,
  'hotel': Category.LEISURE,
  'airbnb': Category.LEISURE,

  // Compras
  'amazon': Category.SHOPPING,
  'mercadolivre': Category.SHOPPING,
  'shopee': Category.SHOPPING,
  'shein': Category.SHOPPING,
  'loja': Category.SHOPPING,
  'roupa': Category.SHOPPING,
  'tênis': Category.SHOPPING,
  'shopping': Category.SHOPPING,

  // Salário/Investimento
  'salário': Category.SALARY,
  'proventos': Category.INVESTMENT,
  'rendimento': Category.INVESTMENT,
  'dividendo': Category.INVESTMENT
};

export function detectCategory(description: string): Category | null {
  const text = description.toLowerCase();

  for (const keyword in categoryRules) {
    if (text.includes(keyword)) {
      return categoryRules[keyword];
    }
  }

  return null;
}