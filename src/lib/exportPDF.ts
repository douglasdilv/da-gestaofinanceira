import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { AnnualSummary, AppMode } from '@/types'
import { formatCurrency, getMonthName } from './utils'

export async function exportToPDF(report: AnnualSummary, mode: AppMode) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const primaryColor: [number, number, number] = [79, 55, 138]
  const goldColor: [number, number, number] = [201, 167, 77]
  const grayColor: [number, number, number] = [73, 69, 81]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('D&A Gestão Financeira', 15, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Relatório ${mode === 'personal' ? 'Pessoal' : 'Empresarial'} — ${report.year}`, 15, 28)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 35)

  // Annual summary section
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Anual', 15, 52)

  doc.setDrawColor(...goldColor)
  doc.setLineWidth(0.5)
  doc.line(15, 54, 195, 54)

  // Summary grid
  const summaryData = [
    ['Receita Total do Ano', formatCurrency(report.totalIncome)],
    ['Despesa Total do Ano', formatCurrency(report.totalExpenses)],
    ['Lucro Líquido', formatCurrency(report.netProfit)],
    ['ROI do Ano', `${report.roi.toFixed(2)}%`],
    ['Melhor Mês', getMonthName(report.bestMonth)],
    ['Pior Mês', getMonthName(report.worstMonth)],
    ['Total de Movimentações', String(report.totalTransactions)],
  ]

  autoTable(doc, {
    startY: 58,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80, textColor: [...grayColor] },
      1: { cellWidth: 60, fontStyle: 'normal' },
    },
  })

  const afterSummary = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Monthly breakdown
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalhamento Mensal', 15, afterSummary)

  doc.setDrawColor(...goldColor)
  doc.line(15, afterSummary + 2, 195, afterSummary + 2)

  const monthRows = report.months.map(m => [
    getMonthName(m.month),
    formatCurrency(m.totalIncome),
    formatCurrency(m.totalExpenses),
    formatCurrency(m.netBalance),
    `${m.roi.toFixed(1)}%`,
    String(m.incomeCount + m.expenseCount),
  ])

  autoTable(doc, {
    startY: afterSummary + 6,
    head: [['Mês', 'Receitas', 'Despesas', 'Saldo', 'ROI', 'Qtd.']],
    body: monthRows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 242, 250] },
    styles: { cellPadding: 3 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...primaryColor)
    doc.rect(0, 287, 210, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text('D&A Gestão Financeira — Confidencial', 15, 293)
    doc.text(`Página ${i} de ${pageCount}`, 170, 293)
  }

  doc.save(`DA_Relatorio_${report.year}_${mode === 'personal' ? 'Pessoal' : 'Empresarial'}.pdf`)
}
