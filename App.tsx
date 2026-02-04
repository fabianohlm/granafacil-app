
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip
} from 'recharts';
import { 
  Transaction, MonthlySummary, Category, TransactionType, Goal 
} from './types';
import { CATEGORY_COLORS, MONTH_NAMES } from './constants';
import * as storage from './services/storageService';
import { getFinancialAdvice } from './services/geminiService';
import { calculateMonthlyBalances } from './utils/monthlyBalance';
import { SummaryCard } from './components/SummaryCard';
import { TransactionModal } from './components/TransactionModal';
import { generateMonthlyReport } from './utils/generateReport';

// Icons as inline SVGs for zero dependencies issues
const Icons = {
  Wallet: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  TrendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  TrendingDown: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>,
  CreditCard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  Trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>,
  Plus: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Minus: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>,
  ArrowDown: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
  ArrowUp: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
  Target: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Alert: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
  Calendar: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Refresh: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  FileText: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="M8 18v-2"/><path d="M16 18v-6"/></svg>,
  Graph: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  ChevronDown: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(currentDate.getMonth());
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>(TransactionType.EXPENSE);

  const [advice, setAdvice] = useState<string | null>(null);
  const [isAdviseLoading, setIsAdviseLoading] = useState(false);

  // Initial load via Async DB
  const refreshData = async () => {
    const loadedTransactions = await storage.getTransactions();
    setTransactions(loadedTransactions);
    
    const loadedGoals = await storage.getGoals();
    setGoals(loadedGoals);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update picker state when currentDate changes or modal opens
  useEffect(() => {
    if (showDatePicker) {
      setPickerMonth(currentDate.getMonth());
      setPickerYear(currentDate.getFullYear());
    }
  }, [showDatePicker, currentDate]);

  // Derived state: Current Month String YYYY-MM
  const currentMonthStr = useMemo(() => {
    return currentDate.toISOString().slice(0, 7);
  }, [currentDate]);

  // Derived state: Previous Month String YYYY-MM (For trends)
  const prevMonthStr = useMemo(() => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  }, [currentDate]);

  // Derived state: Filtered transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonthStr))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date desc
  }, [transactions, currentMonthStr]);

  // Derived state: Monthly Balances for Chart
  const monthlyBalanceData = useMemo(() => {
    return calculateMonthlyBalances(transactions);
  }, [transactions]);

  // Derived state: Summary Stats
  const summary = useMemo(() => {
    // Current Month
    const income = monthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = monthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    
    // Previous Month for Trends
    const prevTransactions = transactions.filter(t => t.date.startsWith(prevMonthStr));
    const prevIncome = prevTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const prevExpense = prevTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    
    // Future debt calculation: All installments in FUTURE months from current date
    const todayStr = new Date().toISOString().slice(0, 7);
    const pending = transactions
      .filter(t => t.isInstallment && t.date > todayStr)
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculate Trends (avoid division by zero)
    const incomeTrend = prevIncome === 0 ? 0 : ((income - prevIncome) / prevIncome) * 100;
    const expenseTrend = prevExpense === 0 ? 0 : ((expense - prevExpense) / prevExpense) * 100;
    const balanceTrend = (prevIncome - prevExpense) === 0 ? 0 : (((income - expense) - (prevIncome - prevExpense)) / (prevIncome - prevExpense)) * 100;

    return { 
        income, 
        expense, 
        balance: income - expense, 
        pendingInstallmentsTotal: pending,
        trends: {
            income: incomeTrend,
            expense: expenseTrend,
            balance: balanceTrend
        }
    };
  }, [monthTransactions, transactions, prevMonthStr]);

  // Chart Data: Categories
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
    return Object.keys(cats)
        .map(key => ({ name: key, value: cats[key] }))
        .sort((a, b) => b.value - a.value); // Sort biggest expenses first
  }, [monthTransactions]);

  // --- SMART FEATURES LOGIC ---

  // 1. Smart Greeting
  const hour = new Date().getHours();
  let greeting = "Olá";
  if (hour < 12) greeting = "Bom dia";
  else if (hour < 18) greeting = "Boa tarde";
  else greeting = "Boa noite";

  let financialMessage = "";
  if (summary.balance > 0) {
    financialMessage = "Seu saldo está positivo 👍";
  } else if (summary.balance < 0) {
    financialMessage = "Atenção ao saldo negativo ⚠️";
  } else {
    financialMessage = "Vamos organizar este mês 💪";
  }

  // 2. Expense Feedback
  let expenseMessage = "";
  const expenseTrend = summary.trends.expense;

  if (expenseTrend < 0) {
    expenseMessage = `Você gastou ${Math.abs(expenseTrend).toFixed(0)}% a menos que mês passado 👏`;
  } else if (expenseTrend > 0) {
    expenseMessage = `Seus gastos aumentaram ${Math.abs(expenseTrend).toFixed(0)}% este mês ⚠️`;
  } else {
    expenseMessage = "Seus gastos estão estáveis.";
  }

  // 4. Intelligent Alerts
  const alerts: string[] = [];
  if (summary.balance < 0) {
    alerts.push("Seu saldo está negativo. Cuidado ⚠️");
  }
  if (summary.expense > summary.income && summary.income > 0) {
    alerts.push("Gastos maiores que ganhos 🚨");
  }
  if (summary.trends.expense > 20) {
    alerts.push("Gastos aumentaram +20% 📈");
  }

  // 5. Forecast Logic
  const today = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
  
  const dailyAverageExpense = daysPassed > 0 ? summary.expense / daysPassed : 0;
  const projectedExpenses = dailyAverageExpense * daysInMonth;
  const projectedBalance = summary.income - projectedExpenses;

  // 6. Automatic Recurring Detection
  const recurringExpenses = useMemo(() => {
    // Only check expenses
    const currentMonthExpenses = monthTransactions.filter(t => t.type === TransactionType.EXPENSE);
    
    // Find expenses that have the same description as any transaction in the overall history (excluding self)
    const detected = currentMonthExpenses.filter(t => {
      // Find occurrences of this description in ALL transactions (history)
      const count = transactions.filter(h => h.description.trim().toLowerCase() === t.description.trim().toLowerCase() && h.type === TransactionType.EXPENSE).length;
      return count >= 2;
    });

    // Remove duplicates from list (show unique descriptions)
    const uniqueMap = new Map();
    detected.forEach(item => {
      if(!uniqueMap.has(item.description)) {
        uniqueMap.set(item.description, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [monthTransactions, transactions]);


  // ----------------------------

  const handleAddTransactions = async (newItems: Transaction[]) => {
    await storage.addTransactionsBatch(newItems);
    await refreshData();
  };

  const handleDelete = async (id: number | undefined, groupId?: string) => {
    if (!id && !groupId) return;
    
    if (groupId && confirm("Deseja apagar todas as parcelas desta compra?")) {
      await storage.deleteGroup(groupId);
    } else if (id) {
      await storage.deleteTransaction(id);
    }
    await refreshData();
  };

  const handleAddToGoal = async (goalId: number | undefined, amount: number) => {
    if (goalId === undefined) return;
    await storage.updateGoal(goalId, amount);
    await refreshData();
  };

  const handleGenerateAdvice = async () => {
    setIsAdviseLoading(true);
    const result = await getFinancialAdvice(transactions, currentMonthStr);
    setAdvice(result);
    setIsAdviseLoading(false);
  };

  const applyDateChange = () => {
    const newDate = new Date(pickerYear, pickerMonth, 1);
    setCurrentDate(newDate);
    setAdvice(null);
    setShowDatePicker(false);
  };

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const isCurrentRealMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-900">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl flex flex-col pb-24">
        
        {/* NEW HEADER DESIGN */}
        <header className="bg-slate-50/90 backdrop-blur-md sticky top-0 z-30 px-5 py-3 flex items-center justify-between border-b border-slate-200">
          
          {/* Left: App Logo */}
          <div className="flex-shrink-0">
             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white shadow-green-200 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
             </div>
          </div>

          {/* Center: Brand Name */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-0.5 pointer-events-none">
             <span className="text-xl font-bold text-slate-900 tracking-tight">Grana</span>
             <span className="text-xl font-bold text-green-600 tracking-tight">Fácil</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm active:scale-95 transition-all group hover:border-green-200"
            >
                <span className="text-slate-500 group-hover:text-green-600 transition-colors">
                    {React.cloneElement(Icons.Calendar as React.ReactElement<any>, { width: 14, height: 14 })}
                </span>
                <span className="text-xs font-bold text-slate-700 capitalize">
                    {MONTH_NAMES[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
                </span>
                <span className="text-slate-400">
                   {React.cloneElement(Icons.ChevronDown as React.ReactElement<any>, { width: 14, height: 14 })}
                </span>
            </button>
          </div>

        </header>

        <main className="px-4 py-5 space-y-6 flex-1 overflow-y-auto">
          
          {/* Simple Greeting & Report Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
              {greeting}, Gestor! 👋
              </h2>
              <p className="text-sm text-slate-500 font-medium">{financialMessage}</p>
            </div>
            
            <button 
                onClick={() => generateMonthlyReport(monthTransactions, summary, MONTH_NAMES[currentDate.getMonth()])}
                className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                title="Baixar Relatório"
            >
                {React.cloneElement(Icons.FileText as React.ReactElement<any>, { width: 20, height: 20 })}
            </button>
          </div>

          {/* KPI Cards: Grid Compacto */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard 
              title="Receitas" 
              value={summary.income} 
              type="income" 
              icon={Icons.TrendingUp} 
            />
            <SummaryCard 
              title="Despesas" 
              value={summary.expense} 
              type="expense" 
              icon={Icons.TrendingDown} 
            />
            <SummaryCard 
              title="Saldo" 
              value={summary.balance} 
              type="balance" 
              icon={Icons.Wallet} 
              highlight 
            />
            <SummaryCard 
              title="Futuro" 
              value={summary.pendingInstallmentsTotal} 
              type="debt" 
              icon={Icons.CreditCard} 
            />
          </div>

          {/* Expense Feedback Banner */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
            <div className={`p-1.5 rounded-full ${expenseTrend > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              {expenseTrend > 0 ? Icons.TrendingUp : Icons.TrendingDown}
            </div>
            <span className="font-medium">{expenseMessage}</span>
          </div>

          {/* EVOLUTION CHART */}
          <div className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all ${monthlyBalanceData.length === 0 ? 'min-h-[120px] flex flex-col justify-center' : ''}`}>
             <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-100 text-green-600 p-1.5 rounded-lg">
                   {Icons.Graph}
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Evolução</h3>
             </div>
             
             {monthlyBalanceData.length > 0 ? (
                <div className="h-[180px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={monthlyBalanceData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis 
                         dataKey="month" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fontSize: 10, fill: '#94a3b8'}} 
                         dy={10}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fontSize: 9, fill: '#94a3b8'}} 
                         tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
                       />
                       <LineTooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                         formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Saldo']}
                       />
                       <Line
                         type="monotone"
                         dataKey="balance"
                         stroke="#16a34a"
                         strokeWidth={3}
                         dot={{ r: 3, fill: '#16a34a', strokeWidth: 1, stroke: '#fff' }}
                         activeDot={{ r: 5 }}
                       />
                     </LineChart>
                   </ResponsiveContainer>
                </div>
             ) : (
                <div className="flex items-center justify-center text-slate-400 text-xs py-4">
                   Sem dados suficientes para exibir o gráfico.
                </div>
             )}
          </div>

          {/* ALERTAS INTELIGENTES */}
          {alerts.length > 0 && (
              <div className="bg-red-50 p-4 rounded-2xl shadow-sm animate-fade-in border border-red-100">
                  <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-sm">
                      {Icons.Alert}
                      <span>Atenção</span>
                  </div>
                  <div className="space-y-2">
                      {alerts.map((alert, i) => (
                      <div key={i} className="bg-white/60 p-2 rounded-xl text-xs font-medium text-red-600 flex items-start gap-2 border border-red-100/50">
                          <span>•</span> {alert}
                      </div>
                      ))}
                  </div>
              </div>
          )}

          {/* PREVISÃO */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Previsão Fim do Mês</h3>
                    <div className={`text-2xl font-bold tracking-tight ${projectedBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                       R$ {projectedBalance.toFixed(0)}
                    </div>
                 </div>
                 <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                   {Icons.Calendar}
                 </div>
             </div>
             <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                 <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(daysPassed / daysInMonth) * 100}%` }}></div>
             </div>
             <p className="text-[10px] text-slate-400 mt-2 text-right">
               {Math.round((daysPassed / daysInMonth) * 100)}% do mês concluído
             </p>
          </div>

          {/* METAS */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-green-100 text-green-600 p-1.5 rounded-lg">
                  {Icons.Target}
               </div>
               <h3 className="text-sm font-semibold text-slate-700">Metas</h3>
            </div>
            
            <div className="space-y-4">
              {goals.map(goal => {
                const progress = Math.min((goal.saved / goal.target) * 100, 100);
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-end text-sm mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        {goal.emoji} {goal.name}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden relative">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-slate-500">
                        {Math.round(progress)}% <span className="text-[10px] text-slate-400">({goal.saved}/{goal.target})</span>
                       </span>
                      <button
                        onClick={() => handleAddToGoal(goal.id, 50)}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                      >
                        + R$ 50
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXTRATO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                 <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Extrato</h2>
                 <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{monthTransactions.length}</span>
              </div>
            </div>
            
            <div className="min-h-[100px]">
              {monthTransactions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-400 text-xs">Sem lançamentos.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                {monthTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-4 px-5 border-b border-slate-100 last:border-0 active:bg-slate-50 transition-colors">
                    
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 flex items-center justify-center rounded-2xl text-white shadow-sm text-sm"
                        style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                      >
                         {t.type === TransactionType.INCOME ? Icons.ArrowUp : Icons.ArrowDown}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{t.description}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                           <span>{new Date(t.date).getDate()}/{new Date(t.date).getMonth()+1}</span>
                           <span className="text-slate-300">•</span>
                           <span className="truncate max-w-[80px]">{t.category}</span>
                           {t.isInstallment && (
                              <span className="bg-purple-100 text-purple-700 px-1 rounded font-medium">
                                  {t.currentInstallment}/{t.totalInstallments}
                              </span>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold whitespace-nowrap ${
                          t.type === TransactionType.INCOME ? "text-green-600" : "text-red-600"
                      }`}>
                          {t.type === TransactionType.INCOME ? "+" : "-"} {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id, t.installmentGroupId); }}
                        className="text-slate-300 hover:text-red-500 p-1 -mr-1"
                      >
                        {Icons.Trash}
                      </button>
                    </div>

                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
          
           {/* CATEGORIAS CHART */}
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold text-slate-700 mb-2">Categorias</h2>
              {categoryData.length > 0 ? (
                  <div className="flex items-center gap-4">
                     <div className="h-32 w-32 relative flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} />
                                ))}
                            </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex-1 space-y-2">
                        {categoryData.slice(0, 3).map((cat, i) => (
                            <div key={i} className="flex justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[cat.name as Category] }} />
                                    <span className="text-slate-600 truncate max-w-[80px]">{cat.name}</span>
                                </div>
                                <span className="font-semibold text-slate-800">R$ {cat.value.toFixed(0)}</span>
                            </div>
                        ))}
                     </div>
                  </div>
              ) : <div className="text-center text-xs text-slate-400 py-4">Sem dados.</div>}
           </div>

           {/* AI ADVISOR */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                     {Icons.Sparkles}
                   </div>
                   <h2 className="text-sm font-bold">IA Advisor</h2>
                 </div>
                 
                 {!advice ? (
                   <div className="space-y-3">
                     <p className="text-blue-100 text-xs leading-relaxed">
                       Receba dicas personalizadas para economizar este mês.
                     </p>
                     <button
                        onClick={handleGenerateAdvice}
                        disabled={isAdviseLoading || monthTransactions.length === 0}
                        className="w-full bg-white text-blue-700 font-bold py-3 rounded-2xl hover:bg-blue-50 active:scale-95 transition-all text-sm flex justify-center items-center gap-2 shadow-sm"
                     >
                        {isAdviseLoading ? 'Analisando...' : 'Gerar Dicas'}
                     </button>
                   </div>
                 ) : (
                    <div className="animate-fade-in">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/10">
                         <div className="text-xs text-white leading-relaxed space-y-2 advice-content" dangerouslySetInnerHTML={{ __html: advice }} />
                      </div>
                      <button 
                        onClick={() => setAdvice(null)}
                        className="text-[10px] text-blue-200 underline"
                      >
                        Nova análise
                      </button>
                    </div>
                 )}
               </div>
            </div>

        </main>

        {/* Floating Mobile Buttons (Updated with transparency) */}
        <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-40">
          <button
            onClick={() => openModal(TransactionType.INCOME)}
            className="w-14 h-14 rounded-full bg-green-500/90 backdrop-blur-sm text-white shadow-lg shadow-green-200 flex items-center justify-center active:scale-90 transition-all border-2 border-slate-800"
          >
            {Icons.Plus}
          </button>
          <button
            onClick={() => openModal(TransactionType.EXPENSE)}
            className="w-14 h-14 rounded-full bg-red-500/90 backdrop-blur-sm text-white shadow-lg shadow-red-200 flex items-center justify-center active:scale-90 transition-all border-2 border-slate-800"
          >
            {Icons.Minus}
          </button>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-5">
                 <h3 className="text-lg font-bold text-slate-800">Escolher Período</h3>
                 <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>

              <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Mês</label>
                    <select
                        value={pickerMonth}
                        onChange={e => setPickerMonth(Number(e.target.value))}
                        className="w-full p-3 bg-slate-50 border-slate-100 rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {MONTH_NAMES.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Ano</label>
                    <select
                        value={pickerYear}
                        onChange={e => setPickerYear(Number(e.target.value))}
                        className="w-full p-3 bg-slate-50 border-slate-100 rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {/* Generates range: Current Year - 2 to + 3 */}
                        {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                  </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                   onClick={() => setShowDatePicker(false)}
                   className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                    Cancelar
                </button>
                <button
                  onClick={applyDateChange}
                  className="flex-1 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTransactions}
        initialType={modalType}
      />
    </div>
  );
};

export default App;
