import {
  firestoreRestGetDocument,
  firestoreRestGetCollection,
} from "@/lib/firestore-rest";
import { readJsonFile } from "@/lib/server-storage";
import { Invoice } from "@/lib/invoice";

const INVOICES_FILENAME = "invoices.json";

export const SAMPLE_INVOICE: Invoice = {
  id: "inv_sample_001",
  invoiceNumber: "LM-202610-001",
  title: "Professional Digital Engineering Invoice",
  createdAt: "2026-10-14T03:00:00Z",
  updatedAt: "2026-10-14T03:00:00Z",
  date: "2026-10-14",
  dueDate: "2026-10-21",
  status: "paid",
  currency: "BDT",
  company: {
    name: "Liku Media",
    tagline: "Software Engineering & Digital Media Agency",
    phone: "+880 1850290529",
    email: "info@liku.media",
    website: "https://liku.media",
    address: "Dhap, Rangpur - 5400, Bangladesh",
  },
  client: {
    name: "Tanvir Ahmed",
    company: "Liku Media Client",
    phone: "+880 1850290529",
    email: "client@example.com",
    address: "Dhaka, Bangladesh",
  },
  items: [
    {
      id: "item_1",
      description: "Custom Full-Stack Next.js Application Architecture",
      quantity: 1,
      unitPrice: 25000,
      amount: 25000,
    },
    {
      id: "item_2",
      description: "Dedicated Multi-Tenant SMS Gateway Integration & API Config",
      quantity: 1,
      unitPrice: 5000,
      amount: 5000,
    },
  ],
  subtotal: 30000,
  discountType: "fixed",
  discountValue: 2000,
  discountAmount: 2000,
  taxPercent: 0,
  taxAmount: 0,
  total: 28000,
  paidAmount: 28000,
  dueAmount: 0,
  paymentMethod: "bKash / Bank Transfer",
  paymentDetails: "• bKash Personal: 01850290529\n• City Bank A/C: 123456789 (Rangpur Branch)",
  notes: "Thank you for your business!",
  terms: "১. ইনভয়েস প্রাপ্তির ৭ কার্যদিবসের মধ্যে বিল পরিশোধযোগ্য।\n২. কোনো জিজ্ঞাসায় +880 1850290529 নম্বরে যোগাযোগ করুন।",
};

export async function getInvoiceByIdOrNumber(rawId: string): Promise<Invoice | null> {
  if (!rawId) return null;
  const cleanId = decodeURIComponent(rawId).trim();

  // 1. Check if sample invoice is requested
  if (
    cleanId === "inv_sample_001" ||
    cleanId.toUpperCase() === "LM-202610-001" ||
    cleanId.toLowerCase() === "sample"
  ) {
    return SAMPLE_INVOICE;
  }

  // 2. Try direct Firestore document lookup by ID
  try {
    const doc = await firestoreRestGetDocument("invoices", cleanId);
    if (doc && (doc as any).invoiceNumber) {
      return doc as Invoice;
    }
  } catch {
    // Ignore and proceed to fallbacks
  }

  // 3. Check local JSON file storage
  try {
    const localInvoices = readJsonFile<Invoice[]>(INVOICES_FILENAME, []);
    const localMatch = localInvoices.find(
      (inv) =>
        inv.id === cleanId ||
        inv.invoiceNumber.toLowerCase() === cleanId.toLowerCase()
    );
    if (localMatch) return localMatch;
  } catch {
    // Ignore
  }

  // 4. Search Firestore collection by invoiceNumber
  try {
    const remoteList = await firestoreRestGetCollection("invoices");
    if (remoteList && remoteList.length > 0) {
      const remoteMatch = remoteList.find(
        (inv: any) =>
          inv.id === cleanId ||
          (inv.invoiceNumber &&
            inv.invoiceNumber.toLowerCase() === cleanId.toLowerCase())
      );
      if (remoteMatch) return remoteMatch as Invoice;
    }
  } catch {
    // Ignore
  }

  return null;
}
