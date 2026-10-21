"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Invoice, formatCurrency } from "@/lib/invoice";
import { LIKU_LOGO_BASE64 } from "@/lib/logo-base64";
import { Download, AlertCircle, Loader2, Check } from "lucide-react";

interface InvoiceClientViewProps {
  initialInvoice: Invoice | null;
  invoiceId: string;
}

export function InvoiceClientView({ initialInvoice }: InvoiceClientViewProps) {
  const [invoice] = useState<Invoice | null>(initialInvoice);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const verifyUrl = invoice
    ? `https://liku.media/invoice/${invoice.id || invoice.invoiceNumber}`
    : "";

  useEffect(() => {
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 200,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating QR data URL:", err));
  }, [verifyUrl]);

  const handleDownloadPdf = async () => {
    if (!invoice || isDownloading) return;

    const cardElement = document.getElementById("invoice-document-card");
    if (!cardElement) return;

    setIsDownloading(true);

    let exportContainer: HTMLElement | null = null;

    try {
      // 1. Dynamic import of official jspdf and html2canvas packages
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // 2. Clone the invoice into an isolated 794px (exact A4 @ 96 DPI) desktop sheet
      // This completely eliminates any mobile-wrapping or viewport offset issues
      exportContainer = document.createElement("div");
      exportContainer.style.position = "fixed";
      exportContainer.style.left = "-9999px";
      exportContainer.style.top = "0";
      exportContainer.style.width = "794px";
      exportContainer.style.background = "#ffffff";
      exportContainer.style.margin = "0";
      exportContainer.style.padding = "0";
      exportContainer.style.zIndex = "-1000";

      const clone = cardElement.cloneNode(true) as HTMLElement;
      clone.style.width = "794px";
      clone.style.maxWidth = "794px";
      clone.style.minWidth = "794px";
      clone.style.margin = "0";
      clone.style.padding = "32px 36px";
      clone.style.borderRadius = "0";
      clone.style.boxShadow = "none";
      clone.style.border = "none";
      clone.style.background = "#ffffff";
      clone.style.transform = "none";

      exportContainer.appendChild(clone);
      document.body.appendChild(exportContainer);

      // Brief layout stabilization
      await new Promise((resolve) => setTimeout(resolve, 80));

      // 3. Capture with html2canvas directly at 2.5x resolution for print-sharp typography
      const canvas = await html2canvas(clone, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 794,
      });

      // 4. Create A4 jsPDF instance (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // Exactly 10mm margins on both left and right
      const contentWidth = pageWidth - margin * 2; // Exactly 190mm wide, perfectly centered!
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      if (contentHeight <= pageHeight - margin * 2) {
        // Fits on a single A4 page
        pdf.addImage(imgData, "JPEG", margin, margin, contentWidth, contentHeight);
      } else {
        // Multi-page slicing if invoice items overflow A4 height
        let heightLeft = contentHeight;
        let position = margin;
        pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
        heightLeft -= pageHeight - margin * 2;

        while (heightLeft > 0) {
          position = margin - (contentHeight - heightLeft);
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
          heightLeft -= pageHeight - margin * 2;
        }
      }

      // 5. Save directly to Downloads folder
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Direct PDF download failed, falling back to print dialog:", err);
      window.print();
    } finally {
      if (exportContainer && exportContainer.parentNode) {
        exportContainer.parentNode.removeChild(exportContainer);
      }
      setIsDownloading(false);
    }
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Invoice Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The requested invoice could not be found. Please check your link or contact Liku Media.
          </p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid" || invoice.dueAmount === 0;
  const isOverdue = invoice.status === "overdue";

  const isChallan =
    invoice?.type === "challan" ||
    invoice?.invoiceNumber?.startsWith("CH-") ||
    invoice?.title?.toLowerCase().includes("challan") ||
    invoice?.title?.includes("চালান");

  return (
    <div className="min-h-screen bg-neutral-100 text-slate-900 font-sans py-4 sm:py-8 px-3 sm:px-6 flex flex-col items-center print:bg-white print:p-0 print:m-0 print:min-h-0">
      {/* ======================================================== */}
      {/* TOP BAR: ONLY INVOICE / CHALLAN # & DOWNLOAD PDF BUTTON */}
      {/* ======================================================== */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-1 print:hidden">
        <div className="text-xs font-mono font-semibold text-slate-500">
          {isChallan ? "Challan" : "Invoice"} #{invoice.invoiceNumber}
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow transition hover:scale-[1.02] active:scale-95 ${
            downloadSuccess
              ? "bg-emerald-600 text-white"
              : isDownloading
              ? "bg-slate-700 text-slate-200 cursor-wait"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
          title="Download PDF file directly"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading PDF...
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" /> Downloaded!
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" /> Download PDF
            </>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* MAIN INVOICE / CHALLAN DOCUMENT SHEET */}
      {/* ======================================================== */}
      <main
        id="invoice-document-card"
        className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 p-6 sm:p-10 space-y-5 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LIKU_LOGO_BASE64}
                alt="Liku Media"
                className="h-8 sm:h-9 w-auto object-contain block"
              />
            </div>
            <div className="text-[10.5px] text-slate-500 leading-relaxed font-sans pt-0.5">
              <div>{invoice.company.address}</div>
              <div>
                Phone: <span className="font-mono text-slate-700">{invoice.company.phone}</span> • Email:{" "}
                <span className="text-slate-700">{invoice.company.email}</span>
              </div>
            </div>
          </div>

          {/* Right: Invoice / Challan Meta */}
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {isChallan ? "CHALLAN (চালান)" : "INVOICE"}
            </div>
            <div className="text-xs font-mono font-bold text-rose-600 mt-0.5">
              #{invoice.invoiceNumber}
            </div>
            <div className="mt-1.5 text-xs space-y-0.5 text-slate-600">
              <div>
                <span className="text-slate-400 uppercase text-[9.5px] font-bold">Date:</span>{" "}
                <strong className="text-slate-900 font-mono">{invoice.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[9.5px] font-bold">
                  {isChallan ? "Delivery Date:" : "Due Date:"}
                </span>{" "}
                <strong className="text-slate-900 font-mono">{invoice.dueDate}</strong>
              </div>
              <div className="pt-1">
                {isChallan ? (
                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider border bg-cyan-50 text-cyan-800 border-cyan-300">
                    চালান / CHALLAN
                  </span>
                ) : (
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider border ${
                      isPaid
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : isOverdue
                        ? "bg-rose-50 text-rose-800 border-rose-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {isPaid ? "PAID" : isOverdue ? "OVERDUE" : "PENDING"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Client & Billed / Delivered To Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-600 block">
              {isChallan ? "DELIVERED TO / গ্রহীতা:" : "BILLED TO:"}
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              {invoice.client.name || "Client Name"}
              {invoice.client.company && (
                <span className="text-slate-600 font-normal text-xs">
                  {" "}
                  • {invoice.client.company}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              {invoice.client.phone && <span>Phone: {invoice.client.phone}</span>}
              {invoice.client.email && <span> • Email: {invoice.client.email}</span>}
              {invoice.client.address && <span> • Address: {invoice.client.address}</span>}
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">
              {isChallan ? "DISPATCH / পরিবহন:" : "PAYMENT METHOD:"}
            </span>
            <div className="text-xs font-semibold text-slate-900 mt-0.5">
              {invoice.paymentMethod || (isChallan ? "কুরিয়ার / হ্যান্ড ডেলিভারি" : "bKash / Bank Transfer")}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          {isChallan ? (
            /* Challan Table: Items & Quantity Only (No Prices) */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[9.5px] font-bold tracking-wider">
                  <th className="py-2 px-2.5 rounded-l w-12">#</th>
                  <th className="py-2 px-2.5">ITEM / DESCRIPTION (বিবরণ)</th>
                  <th className="py-2 px-2.5 text-center rounded-r w-32">QUANTITY (পরিমাণ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                    <td className="py-2.5 px-2.5">
                      <div className="font-semibold text-slate-900 text-xs">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-900 text-sm">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Standard Invoice Table (With Prices) */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[9.5px] font-bold tracking-wider">
                  <th className="py-2 px-2.5 rounded-l">#</th>
                  <th className="py-2 px-2.5">ITEM / SERVICE DESCRIPTION</th>
                  <th className="py-2 px-2.5 text-center">QTY</th>
                  <th className="py-2 px-2.5 text-right">UNIT PRICE</th>
                  <th className="py-2 px-2.5 text-right rounded-r">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                    <td className="py-2.5 px-2.5">
                      <div className="font-semibold text-slate-900 text-xs">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono text-xs text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-xs text-slate-700">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-900 text-xs">
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary (Challan: Total Quantity Only vs Invoice: Financial Breakdown) */}
        {isChallan ? (
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-1">
            <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 p-3.5 rounded-lg text-xs space-y-1.5 text-slate-700">
              <div className="font-bold text-slate-900 uppercase text-[9.5px] tracking-wider">
                Delivery & Dispatch Details (সরবরাহের বিবরণ)
              </div>
              <div className="whitespace-pre-wrap font-mono leading-relaxed text-[10.5px] text-slate-600">
                {invoice.paymentDetails || "পণ্য যথাযথভাবে অক্ষত অবস্থায় বুঝে নেওয়ার জন্য অনুরোধ করা হচ্ছে।"}
              </div>
            </div>

            <div className="w-full sm:w-60 bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                Total Items / মোট পরিমাণ
              </span>
              <div className="text-2xl font-black font-mono text-slate-900">
                {invoice.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}{" "}
                <span className="text-xs font-semibold text-slate-500">টি (Items)</span>
              </div>
              <div className="text-[10px] font-semibold text-cyan-800 bg-cyan-100/70 border border-cyan-200 px-2 py-1 rounded">
                ✓ ডেলিভারি চালান (কোনো মূল্য অন্তর্ভুক্ত নয়)
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-1">
            {/* Payment Instructions */}
            <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 p-3.5 rounded-lg text-xs space-y-1.5 text-slate-700">
              <div className="font-bold text-slate-900 uppercase text-[9.5px] tracking-wider">
                Payment Instructions
              </div>
              <div className="whitespace-pre-wrap font-mono leading-relaxed text-[10.5px] text-slate-600">
                {invoice.paymentDetails}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="w-full sm:w-64 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between py-0.5">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 py-0.5">
                  <span>
                    Discount {invoice.discountType === "percent" ? `(${invoice.discountValue}%)` : ""}:
                  </span>
                  <span className="font-mono font-semibold">
                    -{formatCurrency(invoice.discountAmount, invoice.currency)}
                  </span>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>Tax / VAT ({invoice.taxPercent}%):</span>
                  <span className="font-mono font-semibold">
                    +{formatCurrency(invoice.taxAmount, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-b border-slate-200 py-1.5">
                <span>Total Amount:</span>
                <span className="font-mono text-rose-600">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold text-[11px] py-0.5">
                <span>Amount Paid:</span>
                <span className="font-mono">
                  {formatCurrency(invoice.paidAmount, invoice.currency)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg text-rose-950 font-bold text-xs">
                <span>Balance Due:</span>
                <span className="font-mono text-rose-600 font-black">
                  {formatCurrency(invoice.dueAmount, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions + QR & Signature */}
        <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-end gap-3 text-xs text-slate-500">
          <div className="space-y-1 max-w-sm">
            <strong className="text-slate-800 text-[9.5px] uppercase tracking-wider block">
              Terms & Conditions:
            </strong>
            <div className="whitespace-pre-wrap leading-relaxed text-[10px]">
              {invoice.terms}
            </div>
          </div>

          <div className="flex items-center gap-5">
            {isChallan && (
              <div className="text-left shrink-0">
                <div className="h-6" />
                <div className="border-t border-slate-400 pt-0.5 text-[11px] font-bold text-slate-900">
                  Receiver&apos;s Signature (গ্রহীতার স্বাক্ষর)
                </div>
                <div className="text-[9px] text-slate-400">Date & Seal / তারিখ ও সীল</div>
              </div>
            )}

            {/* QR Verification */}
            <div className="text-center space-y-0.5">
              <div className="border border-slate-200 p-0.5 rounded bg-white inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Verify Invoice"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 animate-pulse rounded" />
                )}
              </div>
              <div className="text-[8px] text-slate-400 font-mono">Scan to Verify</div>
            </div>

            {/* Signature */}
            <div className="text-right shrink-0">
              <div className="h-6" />
              <div className="border-t border-slate-400 pt-0.5 text-[11px] font-bold text-slate-900">
                Authorized Signature
              </div>
              <div className="text-[9px] text-slate-400">Liku Media Accounts</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
