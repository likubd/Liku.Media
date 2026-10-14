import { NextRequest, NextResponse } from "next/server";
import {
  firestoreRestGetCollection,
  firestoreRestSetDocument,
  firestoreRestDeleteDocument,
  firestoreRestGetDocument,
} from "@/lib/firestore-rest";
import { readJsonFile, writeJsonFile } from "@/lib/server-storage";
import { Invoice } from "@/lib/invoice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const INVOICES_FILENAME = "invoices.json";

// Default sample invoice for a fresh setup if neither cloud nor local has records
const SAMPLE_INVOICE: Invoice = {
  id: "inv_sample_001",
  invoiceNumber: "LM-202610-001",
  title: "Website Development & SMS Gateway Setup",
  createdAt: new Date().toISOString(),
  date: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
  notes: "Full payment received with thanks.",
  terms: "১. ইনভয়েস প্রাপ্তির ৭ কার্যদিবসের মধ্যে বিল পরিশোধযোগ্য।\n২. কোনো জিজ্ঞাসায় +880 1850290529 নম্বরে যোগাযোগ করুন।",
};

// GET /api/admin/invoices
export async function GET() {
  try {
    const remoteInvoices = await firestoreRestGetCollection("invoices");
    const localInvoices = readJsonFile<Invoice[]>(INVOICES_FILENAME, []);

    if (remoteInvoices && remoteInvoices.length > 0) {
      remoteInvoices.sort((a: any, b: any) => {
        const timeA = new Date(a.date || a.createdAt || 0).getTime();
        const timeB = new Date(b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      writeJsonFile(INVOICES_FILENAME, remoteInvoices);
      return NextResponse.json({ success: true, data: remoteInvoices });
    }

    if (localInvoices && localInvoices.length > 0) {
      // Background sync to Firestore
      for (const inv of localInvoices) {
        if (inv.id) {
          await firestoreRestSetDocument("invoices", inv.id, inv);
        }
      }
      return NextResponse.json({ success: true, data: localInvoices });
    }

    // Seed default sample invoice
    writeJsonFile(INVOICES_FILENAME, [SAMPLE_INVOICE]);
    await firestoreRestSetDocument("invoices", SAMPLE_INVOICE.id, SAMPLE_INVOICE);
    return NextResponse.json({ success: true, data: [SAMPLE_INVOICE] });
  } catch (err: any) {
    const localInvoices = readJsonFile<Invoice[]>(INVOICES_FILENAME, [SAMPLE_INVOICE]);
    return NextResponse.json({ success: true, data: localInvoices });
  }
}

// POST /api/admin/invoices
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      invoiceNumber,
      title,
      date,
      dueDate,
      status,
      currency,
      company,
      client,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxPercent,
      taxAmount,
      total,
      paidAmount,
      dueAmount,
      paymentMethod,
      paymentDetails,
      notes,
      terms,
    } = body;

    if (!invoiceNumber || !client || !client.name) {
      return NextResponse.json(
        { success: false, error: "ইনভয়েস নম্বর এবং ক্লায়েন্টের নাম আবশ্যক।" },
        { status: 400 }
      );
    }

    const docId = id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const invoiceData: Invoice = {
      id: docId,
      invoiceNumber,
      title: title || "Service Invoice",
      createdAt: body.createdAt || nowIso,
      updatedAt: nowIso,
      date: date || nowIso.split("T")[0],
      dueDate: dueDate || nowIso.split("T")[0],
      status: status || "pending",
      currency: currency || "BDT",
      company: company || SAMPLE_INVOICE.company,
      client: {
        name: client.name,
        company: client.company || "",
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
      },
      items: Array.isArray(items) ? items : [],
      subtotal: Number(subtotal) || 0,
      discountType: discountType || "fixed",
      discountValue: Number(discountValue) || 0,
      discountAmount: Number(discountAmount) || 0,
      taxPercent: Number(taxPercent) || 0,
      taxAmount: Number(taxAmount) || 0,
      total: Number(total) || 0,
      paidAmount: Number(paidAmount) || 0,
      dueAmount: Number(dueAmount) || 0,
      paymentMethod: paymentMethod || "bKash / Bank Transfer",
      paymentDetails: paymentDetails || "",
      notes: notes || "",
      terms: terms || "",
    };

    // Save to Firestore REST
    await firestoreRestSetDocument("invoices", docId, invoiceData);

    // Save to local cache
    const currentList = readJsonFile<Invoice[]>(INVOICES_FILENAME, []);
    const existingIndex = currentList.findIndex((item) => item.id === docId);
    if (existingIndex >= 0) {
      currentList[existingIndex] = invoiceData;
    } else {
      currentList.unshift(invoiceData);
    }
    writeJsonFile(INVOICES_FILENAME, currentList);

    return NextResponse.json({ success: true, data: invoiceData });
  } catch (err: any) {
    console.error("Failed to save invoice:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to save invoice" }, { status: 500 });
  }
}

// PATCH /api/admin/invoices (Quick Status / Payment Update)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, paidAmount } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Invoice ID is required" }, { status: 400 });
    }

    const currentList = readJsonFile<Invoice[]>(INVOICES_FILENAME, []);
    const invIndex = currentList.findIndex((item) => item.id === id);
    let invoice = invIndex >= 0 ? currentList[invIndex] : await firestoreRestGetDocument("invoices", id);

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    if (status) {
      invoice.status = status;
      if (status === "paid" && paidAmount === undefined) {
        invoice.paidAmount = invoice.total;
        invoice.dueAmount = 0;
      }
    }

    if (paidAmount !== undefined) {
      const validPaid = Math.max(0, Number(paidAmount));
      invoice.paidAmount = validPaid;
      invoice.dueAmount = Math.max(0, invoice.total - validPaid);
      if (invoice.dueAmount === 0 && invoice.status === "pending") {
        invoice.status = "paid";
      } else if (invoice.dueAmount > 0 && invoice.status === "paid") {
        invoice.status = "pending";
      }
    }

    invoice.updatedAt = new Date().toISOString();

    await firestoreRestSetDocument("invoices", id, invoice);

    if (invIndex >= 0) {
      currentList[invIndex] = invoice;
    } else {
      currentList.unshift(invoice);
    }
    writeJsonFile(INVOICES_FILENAME, currentList);

    return NextResponse.json({ success: true, data: invoice });
  } catch (err: any) {
    console.error("Failed to patch invoice:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/invoices
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });
    }

    await firestoreRestDeleteDocument("invoices", id);

    const currentList = readJsonFile<Invoice[]>(INVOICES_FILENAME, []);
    const filtered = currentList.filter((inv) => inv.id !== id);
    writeJsonFile(INVOICES_FILENAME, filtered);

    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (err: any) {
    console.error("Failed to delete invoice:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
