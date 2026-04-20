/**
 * 給与明細PDF生成（クライアントサイド）
 * jsPDFを使用して日本語対応の給与明細書を生成
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PayrollPDFData {
  employeeName: string;
  employeeCode: string;
  department: string;
  year: number;
  month: number;
  baseSalary: number;
  overtimePay: number;
  lateNightPay: number;
  holidayPay: number;
  positionAllowance: number;
  commuteAllowance: number;
  housingAllowance: number;
  otherAllowance: number;
  totalEarnings: number;
  healthInsurance: number;
  nursingInsurance: number;
  pensionInsurance: number;
  employmentInsurance: number;
  socialInsuranceTotal: number;
  incomeTax: number;
  residentTax: number;
  otherDeduction: number;
  totalDeductions: number;
  netPay: number;
}

const fmt = (n: number) => n.toLocaleString("ja-JP");

export function generatePayslipPDF(data: PayrollPDFData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // jsPDF doesn't natively support Japanese. We use built-in Helvetica
  // and write key labels. For production, embed a Japanese font.
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Payslip / Kyuyo Meisai", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text(`${data.year}/${String(data.month).padStart(2, "0")}`, 105, 28, {
    align: "center",
  });

  // Employee info
  doc.setFontSize(10);
  doc.text(`Employee: ${data.employeeName}`, 15, 40);
  doc.text(`Code: ${data.employeeCode}`, 15, 46);
  doc.text(`Department: ${data.department}`, 120, 40);

  // Earnings table
  autoTable(doc, {
    startY: 55,
    head: [["Shikyuu Koumoku (Earnings)", "Amount (JPY)"]],
    body: [
      ["Kihon-kyu (Base Salary)", fmt(data.baseSalary)],
      ["Zangyo Teate (Overtime Pay)", fmt(data.overtimePay)],
      ["Shinya Teate (Late Night Pay)", fmt(data.lateNightPay)],
      ["Kyujitsu Teate (Holiday Pay)", fmt(data.holidayPay)],
      ["Yakushoku Teate (Position Allow.)", fmt(data.positionAllowance)],
      ["Tsukin Teate (Commute Allow.)", fmt(data.commuteAllowance)],
      ["Jutaku Teate (Housing Allow.)", fmt(data.housingAllowance)],
      ["Sonota Teate (Other Allow.)", fmt(data.otherAllowance)],
      ["Shikyuu Gokei (Total Earnings)", fmt(data.totalEarnings)],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 65, 122], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });

  // Deductions table
  const earningsEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: earningsEndY + 8,
    head: [["Koujo Koumoku (Deductions)", "Amount (JPY)"]],
    body: [
      ["Kenko Hoken (Health Ins.)", fmt(data.healthInsurance)],
      ["Kaigo Hoken (Nursing Ins.)", fmt(data.nursingInsurance)],
      ["Kousei Nenkin (Pension Ins.)", fmt(data.pensionInsurance)],
      ["Koyou Hoken (Employment Ins.)", fmt(data.employmentInsurance)],
      ["Shakai Hoken Gokei (Social Ins. Total)", fmt(data.socialInsuranceTotal)],
      ["Shotoku-zei (Income Tax)", fmt(data.incomeTax)],
      ["Jumin-zei (Resident Tax)", fmt(data.residentTax)],
      ["Sonota Koujo (Other Deduction)", fmt(data.otherDeduction)],
      ["Koujo Gokei (Total Deductions)", fmt(data.totalDeductions)],
    ],
    theme: "grid",
    headStyles: { fillColor: [153, 51, 51], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });

  // Net pay
  const deductionsEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: deductionsEndY + 8,
    head: [["Sashihiki Shikyuu-gaku (Net Pay)", "Amount (JPY)"]],
    body: [[
      "",
      fmt(data.netPay),
    ]],
    theme: "grid",
    headStyles: { fillColor: [34, 120, 74], fontSize: 11 },
    bodyStyles: { fontSize: 14, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    "This payslip is system-generated. For questions, contact the HR department.",
    105,
    285,
    { align: "center" }
  );

  return doc;
}
