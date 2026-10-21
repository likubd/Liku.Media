export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft" | "cancelled";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceCompany {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

export interface InvoiceClient {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
}

export type DocumentType = "invoice" | "challan";

export interface Invoice {
  id: string;
  type?: DocumentType;
  invoiceNumber: string;
  title: string;
  createdAt: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  currency: "BDT" | "USD";
  company: InvoiceCompany;
  client: InvoiceClient;
  items: InvoiceItem[];
  subtotal: number;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  paymentDetails: string;
  notes: string;
  terms: string;
  updatedAt?: string;
}

export const DEFAULT_COMPANY: InvoiceCompany = {
  name: "Liku Media",
  tagline: "Software Engineering & Digital Media Agency",
  phone: "+880 1850290529",
  email: "info@liku.media",
  website: "https://liku.media",
  address: "Dhap, Rangpur - 5400, Bangladesh",
};

export const DEFAULT_TERMS = `1. Payment is due within 7 business days from the date of invoice.
2. Please provide the transaction ID or bank reference upon payment completion.
3. For billing inquiries, contact us at info@liku.media or +880 1850290529.
4. Thank you for partnering with Liku Media!`;

export const DEFAULT_CHALLAN_TERMS = `১. উল্লিখিত পণ্য ও সার্ভিসসমূহ সঠিক মান ও সন্তোষজনক অবস্থায় ডেলিভারি/হস্তান্তর করা হয়েছে।
২. মালামাল বা ডেলিভারি সংক্রান্ত কোনো ত্রুটি থাকলে তা ২৪ ঘণ্টার মধ্যে অবগত করতে হবে।
৩. এই চালান কপি ডেলিভারির চূড়ান্ত ও অফিশিয়াল প্রমাণপত্র হিসেবে গণ্য হবে।
৪. যেকোনো জিজ্ঞাসায় আমাদের হেল্পলাইনে (+880 1850290529) যোগাযোগ করুন।`;

export const DEFAULT_PAYMENT_DETAILS = `• bKash / Nagad (Personal): 01850290529
• Bank Transfer: City Bank / BRAC Bank (Details on request)
• Payment Reference: Please mention the Invoice Number`;

export function formatCurrency(amount: number | string, currency: "BDT" | "USD" = "BDT"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(n)) return currency === "USD" ? "$0.00" : "৳ 0.00";
  const formatted = n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "USD" ? `$${formatted}` : `৳ ${formatted}`;
}

export function generateInvoiceNumber(existingCount = 0): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const serial = String(existingCount + 1).padStart(3, "0");
  return `LM-${year}${month}-${serial || randomSuffix}`;
}

export function generateChallanNumber(existingCount = 0): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const serial = String(existingCount + 1).padStart(3, "0");
  return `CH-${year}${month}-${serial || randomSuffix}`;
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  discountType: "percent" | "fixed" = "fixed",
  discountValue = 0,
  taxPercent = 0,
  paidAmount = 0
) {
  const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  let discountAmount = 0;
  if (discountType === "percent") {
    discountAmount = (subtotal * (Number(discountValue) || 0)) / 100;
  } else {
    discountAmount = Number(discountValue) || 0;
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (afterDiscount * (Number(taxPercent) || 0)) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;

  const validPaid = Math.max(0, Number(paidAmount) || 0);
  const dueAmount = Math.max(0, Math.round((total - validPaid) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total,
    paidAmount: validPaid,
    dueAmount,
  };
}
