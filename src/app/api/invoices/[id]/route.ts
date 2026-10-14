import { NextRequest, NextResponse } from "next/server";
import { getInvoiceByIdOrNumber } from "@/lib/invoice-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/invoices/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params?.id ? decodeURIComponent(params.id).trim() : "";
    if (!rawId) {
      return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });
    }

    const invoice = await getInvoiceByIdOrNumber(rawId);
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to load invoice" }, { status: 500 });
  }
}
