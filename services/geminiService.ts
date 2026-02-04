
import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from "../types";

// ==============================================================================
// CONFIGURAÇÃO DA API KEY
// Para rodar no GitHub Pages ou localmente, cole sua chave da API do Google Gemini
// abaixo, dentro das aspas. 
// Obtenha uma chave em: https://aistudio.google.com/app/apikey
// ==============================================================================
const API_KEY = "COLE_SUA_CHAVE_AQUI"; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getFinancialAdvice = async (
  transactions: Transaction[],
  currentMonth: string
): Promise<string> => {
  // Verificação simples para evitar erro se a chave não for configurada
  if (API_KEY === "COLE_SUA_CHAVE_AQUI" || !API_KEY) {
    return "Por favor, configure sua chave de API (API_KEY) no arquivo services/geminiService.ts para usar a Inteligência Artificial.";
  }

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
