
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance' | 'debt';
  icon: React.ReactNode;
  highlight?: boolean;
  trend?: number; // Percentage change vs last month
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, type, icon, highlight, trend }) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0 // Compact numbers for mobile
  }).format(Math.abs(value));

  const getColor = () => {
    if (highlight) return 'bg-white/20 text-white';
    switch (type) {
      case 'income': return 'text-green-600 bg-green-100';
      case 'expense': return 'text-red-600 bg-red-100';
      case 'balance': return value >= 0 ? 'text-blue-600 bg-blue-100' : 'text-red-600 bg-red-100';
      case 'debt': return 'text-orange-600 bg-orange-100';
    }
  };

  const containerClasses = highlight 
    ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200/50 border-transparent"
    : "bg-white text-slate-900 border border-slate-100";

  const titleColor = highlight ? "text-green-50" : "text-slate-400";
  
  const valueClass = highlight 
    ? "text-white" 
    : (type === 'balance' && value < 0 ? 'text-red-600' : 'text-slate-800');

  return (
    <div className={`${containerClasses} p-4 rounded-2xl shadow-sm flex flex-col justify-between h-[100px] active:scale-95 transition-transform duration-200`}>
      <div className="flex justify-between items-start">
        <div className={`p-1.5 rounded-lg ${getColor()} bg-opacity-50`}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { width: 16, height: 16 })
            : icon}
        </div>
      </div>
      
      <div>
        <p className={`text-[10px] uppercase tracking-wide font-semibold mb-0.5 ${titleColor}`}>{title}</p>
        <h3 className={`text-lg font-bold tracking-tight leading-none ${valueClass}`}>
           {type === 'expense' || (type === 'balance' && value < 0) ? '-' : ''}{formattedValue}
        </h3>
      </div>
    </div>
  );
};