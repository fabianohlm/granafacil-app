
import { Transaction, TransactionType } from "../types";
import { MONTH_NAMES } from "../constants";

export function calculateMonthlyBalances(transactions: Transaction[]) {
  const monthlyData: Record<string, number> = {};

  transactions.forEach(t => {
    const date = new Date(t.date);
    // Key format: YYYY-MM for proper sorting
    const key = t.date.slice(0, 7); 

    if (!monthlyData[key]) {
      monthlyData[key] = 0;
    }

    monthlyData[key] += t.type === TransactionType.INCOME ? t.amount : -t.amount;
  });

  // Convert to array and sort chronologically
  return Object.entries(monthlyData)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, balance]) => {
      const [year, month] = date.split('-');
      // Format label like "Jan/24"
      const monthName = MONTH_NAMES[parseInt(month) - 1].slice(0, 3);
      const shortYear = year.slice(2);
      
      return {
        month: `${monthName}/${shortYear}`,
        fullDate: date,
        balance
      };
    })
    .slice(-6); // Show only last 6 months to keep chart clean
}
