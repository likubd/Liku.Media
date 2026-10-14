"use client";

import React, { useState } from "react";
import Image from "next/image";
import Logo from "@/components/img/likumedia-logo.svg";
import { Invoice, formatCurrency } from "@/lib/invoice";
import { Download, AlertCircle, Loader2, Check } from "lucide-react";

interface InvoiceClientViewProps {
  initialInvoice: Invoice | null;
  invoiceId: string;
}

export function InvoiceClientView({ initialInvoice }: InvoiceClientViewProps) {
  const [invoice] = useState<Invoice | null>(initialInvoice);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice || isDownloading) return;

    const cardElement = document.getElementById("invoice-document-card");
    if (!cardElement) return;

    setIsDownloading(true);

    let exportContainer: HTMLElement | null = null;

    try {
      // 1. Ensure html2pdf is loaded into window
      let html2pdfInstance = (window as any).html2pdf;
      if (!html2pdfInstance) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "/js/html2pdf.bundle.min.js";
          script.onload = () => resolve();
          script.onerror = () => {
            const fallbackScript = document.createElement("script");
            fallbackScript.src = "https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
            fallbackScript.onload = () => resolve();
            fallbackScript.onerror = reject;
            document.head.appendChild(fallbackScript);
          };
          document.head.appendChild(script);
        });
        html2pdfInstance = (window as any).html2pdf;
      }

      if (!html2pdfInstance) {
        throw new Error("html2pdf library could not be loaded");
      }

      // 2. Create isolated off-screen clone with exact fixed A4 width (800px)
      // This completely prevents responsive/centered clipping or viewport offsets!
      exportContainer = document.createElement("div");
      exportContainer.style.position = "fixed";
      exportContainer.style.left = "-9999px";
      exportContainer.style.top = "0";
      exportContainer.style.width = "800px";
      exportContainer.style.background = "#ffffff";
      exportContainer.style.margin = "0";
      exportContainer.style.padding = "0";
      exportContainer.style.zIndex = "-1000";

      const clone = cardElement.cloneNode(true) as HTMLElement;
      clone.style.width = "800px";
      clone.style.maxWidth = "800px";
      clone.style.minWidth = "800px";
      clone.style.margin = "0";
      clone.style.padding = "36px 40px";
      clone.style.borderRadius = "0";
      clone.style.boxShadow = "none";
      clone.style.border = "none";
      clone.style.background = "#ffffff";
      clone.style.transform = "none";

      exportContainer.appendChild(clone);
      document.body.appendChild(exportContainer);

      // Wait for any images inside the clone to be ready
      const cloneImages = Array.from(clone.querySelectorAll("img"));
      await Promise.all(
        cloneImages.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          });
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 60));

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `Invoice-${invoice.invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          width: 800,
          windowWidth: 800,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Generate & save directly to Downloads folder
      await html2pdfInstance().set(opt).from(clone).save();

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
  // Point to local same-origin proxy to eliminate CORS taint on canvas
  const qrUrl = `/api/qr?data=${encodeURIComponent(
    `https://liku.media/invoice/${invoice.id || invoice.invoiceNumber}`
  )}`;

  return (
    <div className="min-h-screen bg-neutral-100 text-slate-900 font-sans py-4 sm:py-8 px-3 sm:px-6 flex flex-col items-center print:bg-white print:p-0 print:m-0 print:min-h-0">
      {/* ======================================================== */}
      {/* TOP BAR: ONLY INVOICE # & DOWNLOAD PDF BUTTON */}
      {/* ======================================================== */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-1 print:hidden">
        <div className="text-xs font-mono font-semibold text-slate-500">
          Invoice #{invoice.invoiceNumber}
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
      {/* MAIN INVOICE DOCUMENT SHEET */}
      {/* ======================================================== */}
      <main
        id="invoice-document-card"
        className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 p-6 sm:p-10 space-y-5 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="logo-box">
              <Image
                src={Logo}
                alt="Liku Media"
                className="h-8 sm:h-9 w-auto object-contain"
                priority
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

          {/* Right: Invoice Meta */}
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              INVOICE
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
                <span className="text-slate-400 uppercase text-[9.5px] font-bold">Due Date:</span>{" "}
                <strong className="text-slate-900 font-mono">{invoice.dueDate}</strong>
              </div>
              <div className="pt-1">
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
              </div>
            </div>
          </div>
        </div>

        {/* Client & Billed To Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-600 block">
              BILLED TO:
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
              PAYMENT METHOD:
            </span>
            <div className="text-xs font-semibold text-slate-900 mt-0.5">
              {invoice.paymentMethod || "bKash / Bank Transfer"}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
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
        </div>

        {/* Payment Instructions & Totals Summary */}
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
            {/* QR Verification */}
            <div className="text-center space-y-0.5">
              <div className="border border-slate-200 p-0.5 rounded bg-white inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="Verify Invoice"
                  className="w-12 h-12 object-contain"
                  crossOrigin="anonymous"
                />
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
