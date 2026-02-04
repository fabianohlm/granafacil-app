import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from "../types";

// Initialize the client. 
// NOTE: In a real production app, ensure strict backend proxying if exposing to public.
// For this demo, we assume process.env.API_KEY is available in the build environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  transactions: Transaction[],
  currentMonth: string
): Promise<string> => {
  try {
    const relevantTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const summary = {
      totalIncome: relevantTransactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: relevantTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0),
      topCategories: relevantTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .map(t => t.category),
      installmentsCount: relevantTransactions.filter(t => t.isInstallment).length
    };

    const prompt = `
      Atue como um consultor financeiro pessoal especialista.
      Analise os seguintes dados do mês atual (${currentMonth}):
      ${JSON.stringify(summary)}
      
      Por favor, forneça 3 conselhos curtos, diretos e acionáveis (em formato de lista HTML <ul><li>) para melhorar a saúde financeira.
      Foque em reduzir gastos nas categorias mais frequentes ou alerta sobre o volume de parcelas se for alto.
      Use tom encorajador mas realista. Responda em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar conselhos no momento.";
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "O serviço de inteligência artificial está temporariamente indisponível. Verifique sua chave de API.";
  }
};
