import {
  firestoreRestGetDocument,
  firestoreRestGetCollection,
} from "@/lib/firestore-rest";
import { readJsonFile } from "@/lib/server-storage";
import { Invoice } from "@/lib/invoice";

const INVOICES_FILENAME = "invoices.json";

export async function getInvoiceByIdOrNumber(rawId: string): Promise<Invoice | null> {
  if (!rawId) return null;
  const cleanId = decodeURIComponent(rawId).trim();

  // 1. Try direct Firestore document lookup by ID
  try {
    const doc = await firestoreRestGetDocument("invoices", cleanId);
    if (doc && (doc as any).invoiceNumber) {
      return doc as Invoice;
    }
  } catch {
    // Ignore and proceed to fallbacks
  }

  // 2. Check local JSON file storage
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

  // 3. Search Firestore collection by invoiceNumber
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
