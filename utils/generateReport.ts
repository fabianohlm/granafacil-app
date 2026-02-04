
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Transaction, TransactionType } from "../types";

export function generateMonthlyReport(
  transactions: Transaction[],
  summary: { income: number; expense: number; balance: number },
  monthName: string
) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFillColor(22, 163, 74); // Green 600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("GranaFácil - Relatório", 14, 20);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Mês de Referência: ${monthName}`, 14, 30);

  // Resumo
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(12);
  doc.text("Resumo do Mês", 14, 50);

  const startY = 55;
  
  // Cards de resumo desenhados manualmente
  // Receita
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(22, 163, 74); // Green 600
  doc.roundedRect(14, startY, 55, 25, 3, 3, 'FD');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.text("Receitas", 18, startY + 8);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`R$ ${summary.income.toFixed(2)}`, 18, startY + 18);

  // Despesa
  doc.setFillColor(254, 242, 242); // Red 50
  doc.setDrawColor(220, 38, 38); // Red 600
  doc.roundedRect(77, startY, 55, 25, 3, 3, 'FD');
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Despesas", 81, startY + 8);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`R$ ${summary.expense.toFixed(2)}`, 81, startY + 18);

  // Saldo
  const balanceColor = summary.balance >= 0 ? [22, 163, 74] : [220, 38, 38];
  const balanceBg = summary.balance >= 0 ? [240, 253, 244] : [254, 242, 242];
  
  doc.setFillColor(balanceBg[0], balanceBg[1], balanceBg[2]); 
  doc.setDrawColor(balanceColor[0], balanceColor[1], balanceColor[2]);
  doc.roundedRect(140, startY, 55, 25, 3, 3, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Saldo Líquido", 144, startY + 8);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
  doc.text(`R$ ${summary.balance.toFixed(2)}`, 144, startY + 18);

  // Tabela
  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.description,
    t.category,
    t.type === TransactionType.INCOME ? `+ R$ ${t.amount.toFixed(2)}` : `- R$ ${t.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 90,
    head: [["Data", "Descrição", "Categoria", "Valor"]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40 },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
            const raw = data.cell.raw as string;
            if (raw.startsWith('+')) {
                data.cell.styles.textColor = [22, 163, 74];
            } else {
                data.cell.styles.textColor = [220, 38, 38];
            }
        }
    }
  });

  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Gerado por GranaFácil - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(`relatorio-${monthName.toLowerCase()}.pdf`);
}