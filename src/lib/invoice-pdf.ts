import { Invoice, formatCurrency } from "@/lib/invoice";
import { LIKU_LOGO_BASE64 } from "@/lib/logo-base64";

export function printInvoicePdf(invoice: Invoice, logoUrl?: string) {
  const finalLogo = logoUrl || LIKU_LOGO_BASE64;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Pop-up is blocked. Please allow pop-ups in your browser to view the invoice.");
    return;
  }

  const {
    invoiceNumber,
    date,
    dueDate,
    status,
    currency,
    company,
    client,
    items,
    subtotal,
    discountAmount,
    discountType,
    discountValue,
    taxPercent,
    taxAmount,
    total,
    paidAmount,
    dueAmount,
    paymentMethod,
    paymentDetails,
    terms,
  } = invoice;

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    paid: { bg: "#ecfdf5", text: "#059669", border: "#10b981" },
    pending: { bg: "#fffbeb", text: "#d97706", border: "#f59e0b" },
    overdue: { bg: "#fef2f2", text: "#dc2626", border: "#ef4444" },
    draft: { bg: "#f1f5f9", text: "#64748b", border: "#94a3b8" },
    cancelled: { bg: "#f8fafc", text: "#94a3b8", border: "#cbd5e1" },
  };

  const statusStyle = statusColors[status] || statusColors.pending;

  const isChallan = invoice.type === "challan" || invoice.invoiceNumber?.startsWith("CH-") || invoice.title?.toLowerCase().includes("challan") || invoice.title?.includes("চালান");
  const docTypeLabel = isChallan ? "DELIVERY CHALLAN (চালান)" : "INVOICE";
  const docTitle = isChallan ? `Challan #${invoiceNumber}` : `Invoice #${invoiceNumber}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - ${client.name || "Client"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 28px;
      font-size: 11.5px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }

    /* Modern Clean Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }

    .logo-box {
      margin-bottom: 4px;
    }

    .logo-box img {
      height: 38px;
      width: auto;
      object-fit: contain;
      display: block;
    }

    .company-contact {
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
    }

    .invoice-meta {
      text-align: right;
    }

    .invoice-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .invoice-number {
      font-family: monospace;
      font-size: 12.5px;
      font-weight: 700;
      color: #e11d48;
      margin-top: 1px;
    }

    .dates-strip {
      font-size: 10.5px;
      color: #475569;
      margin-top: 4px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      align-items: center;
    }

    .status-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2.5px 8px;
      border-radius: 12px;
      border: 1px solid ${statusStyle.border};
      background: ${statusStyle.bg};
      color: ${statusStyle.text};
    }

    /* Billed To Card */
    .billed-to-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .section-label {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #e11d48;
      margin-bottom: 2px;
    }

    .client-name {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }

    .client-company {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
    }

    .client-details {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
    }

    .payment-method-box {
      text-align: right;
    }

    .payment-method-val {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }

    /* Modern Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 11.5px;
    }

    th {
      background: #0f172a;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 12px;
      text-align: left;
    }

    th:first-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
      width: 5%;
    }

    th:last-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
      text-align: right;
      width: 15%;
    }

    td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }

    td:last-child {
      text-align: right;
      font-weight: 700;
      font-family: monospace;
      font-size: 12px;
    }

    tr:nth-child(even) td {
      background: #fafafa;
    }

    .item-desc {
      font-weight: 600;
      color: #0f172a;
    }

    /* Financial Breakdown & Instructions */
    .summary-grid {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 16px;
      align-items: flex-start;
    }

    .instructions-card {
      flex: 1;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      background: #f8fafc;
      font-size: 10.5px;
    }

    .instructions-card strong {
      color: #0f172a;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 4px;
    }

    .instructions-content {
      color: #475569;
      white-space: pre-wrap;
      font-family: monospace;
      line-height: 1.5;
    }

    .totals-card {
      width: 260px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11.5px;
    }

    .totals-line {
      display: flex;
      justify-content: space-between;
      color: #475569;
      padding: 1.5px 0;
    }

    .totals-line.grand-total {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      padding: 6px 0;
      margin: 3px 0;
    }

    .totals-line.due-line {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      padding: 6px 10px;
      border-radius: 6px;
      color: #9f1239;
      font-weight: 800;
      font-size: 12.5px;
      display: flex;
      justify-content: space-between;
    }

    /* Footer: Terms and Signature */
    .footer-bar {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 10px;
      color: #64748b;
    }

    .terms-box {
      max-width: 480px;
      line-height: 1.45;
      white-space: pre-wrap;
    }

    .terms-box strong {
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9.5px;
    }

    .signature-box {
      text-align: center;
      width: 150px;
    }

    .signature-line {
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      font-size: 10px;
      font-weight: 700;
      color: #1e293b;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      @page {
        margin: 1.2cm;
        size: A4 portrait;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <!-- Header: ONLY Logo on left, Metadata on right -->
    <div class="header-bar">
      <div>
        <div class="logo-box">
          ${
            finalLogo
              ? `<img src="${finalLogo}" alt="Liku Media Logo" />`
              : `<span style="font-weight:900; font-size:22px; color:#0f172a;">Liku<span style="color:#e11d48;">.</span>Media</span>`
          }
        </div>
        <div class="company-contact">
          ${company.address} • ${company.phone} • ${company.email}
        </div>
      </div>

      <div class="invoice-meta">
        <div class="invoice-title">${docTypeLabel}</div>
        <div class="invoice-number"># ${invoiceNumber}</div>
        <div class="dates-strip">
          <span>Date: <strong>${date}</strong></span>
          <span>•</span>
          <span>${isChallan ? "Delivery:" : "Due:"} <strong>${dueDate}</strong></span>
          ${
            isChallan
              ? `<span class="status-badge" style="background:#ecfeff; border-color:#a5f3fc; color:#0891b2;">চালান / CHALLAN</span>`
              : `<span class="status-badge">${status.toUpperCase()}</span>`
          }
        </div>
      </div>
    </div>

    <!-- Billed / Delivered To Strip -->
    <div class="billed-to-card">
      <div>
        <div class="section-label">${isChallan ? "DELIVERED TO / গ্রহীতা:" : "BILLED TO:"}</div>
        <div class="client-name">${client.name || "Client Name"}</div>
        ${client.company ? `<div class="client-company">${client.company}</div>` : ""}
        <div class="client-details">
          ${client.phone ? `Phone: ${client.phone}` : ""}
          ${client.email ? ` • Email: ${client.email}` : ""}
          ${client.address ? ` • Address: ${client.address}` : ""}
        </div>
      </div>

      <div class="payment-method-box">
        <div class="section-label" style="color: #64748b;">${isChallan ? "DISPATCH / পরিবহন:" : "PAYMENT METHOD:"}</div>
        <div class="payment-method-val">${paymentMethod || (isChallan ? "কুরিয়ার / হ্যান্ড ডেলিভারি" : "bKash / Bank Transfer")}</div>
      </div>
    </div>

    <!-- Line Items Table -->
    ${
      isChallan
        ? `
    <!-- Challan Line Items (No Prices) -->
    <table>
      <thead>
        <tr>
          <th style="width: 8%;">#</th>
          <th style="width: 72%;">ITEM / SERVICE DESCRIPTION (বিবরণ)</th>
          <th style="width: 20%; text-align: center;">QUANTITY / পরিমাণ</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <div class="item-desc">${item.description}</div>
            </td>
            <td style="text-align: center; font-family: monospace; font-weight: 700; font-size: 13px;">${item.quantity}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- Summary (Challan: Total Quantity Only) -->
    <div class="summary-grid">
      <div class="instructions-card" style="flex: 2;">
        <strong>Delivery & Dispatch Details (সরবরাহের বিবরণ):</strong>
        <div class="instructions-content">${paymentDetails || "পণ্য যথাযথভাবে অক্ষত অবস্থায় বুঝে নেওয়ার জন্য অনুরোধ করা হচ্ছে।"}</div>
      </div>

      <div class="totals-card" style="width: 220px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px;">Total Quantity / মোট আইটেম:</div>
        <div style="font-size: 22px; font-weight: 900; color: #0f172a; font-family: monospace;">
          ${items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)} <span style="font-size: 12px; font-weight: 600; color: #64748b;">টি (Items)</span>
        </div>
        <div style="font-size: 9.5px; color: #0284c7; font-weight: 600; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
          ✓ ডেলিভারি চালান (কোনো মূল্য অন্তর্ভুক্ত নয়)
        </div>
      </div>
    </div>
    `
        : `
    <!-- Invoice Line Items (With Unit Price & Amount) -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th style="width: 52%;">ITEM / SERVICE DESCRIPTION</th>
          <th style="width: 13%; text-align: center;">QTY</th>
          <th style="width: 15%; text-align: right;">UNIT PRICE</th>
          <th>AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <div class="item-desc">${item.description}</div>
            </td>
            <td style="text-align: center; font-family: monospace;">${item.quantity}</td>
            <td style="text-align: right; font-family: monospace;">${formatCurrency(item.unitPrice, currency)}</td>
            <td>${formatCurrency(item.amount, currency)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- Summary & Totals -->
    <div class="summary-grid">
      <div class="instructions-card">
        <strong>Payment Instructions:</strong>
        <div class="instructions-content">${paymentDetails || "• bKash / Nagad: 01850290529 (Personal)"}</div>
      </div>

      <div class="totals-card">
        <div class="totals-line">
          <span>Subtotal:</span>
          <span style="font-family: monospace; font-weight: 600;">${formatCurrency(subtotal, currency)}</span>
        </div>

        ${
          discountAmount > 0
            ? `<div class="totals-line" style="color: #dc2626;">
                <span>Discount ${discountType === "percent" ? `(${discountValue}%)` : ""}:</span>
                <span style="font-family: monospace;">- ${formatCurrency(discountAmount, currency)}</span>
              </div>`
            : ""
        }

        ${
          taxAmount > 0
            ? `<div class="totals-line">
                <span>Tax / VAT (${taxPercent}%):</span>
                <span style="font-family: monospace;">+ ${formatCurrency(taxAmount, currency)}</span>
              </div>`
            : ""
        }

        <div class="totals-line grand-total">
          <span>Total Amount:</span>
          <span style="font-family: monospace; color: #0f172a;">${formatCurrency(total, currency)}</span>
        </div>

        <div class="totals-line" style="color: #059669; font-weight: 600;">
          <span>Amount Paid:</span>
          <span style="font-family: monospace;">${formatCurrency(paidAmount, currency)}</span>
        </div>

        <div class="totals-line due-line">
          <span>Balance Due:</span>
          <span style="font-family: monospace;">${formatCurrency(dueAmount, currency)}</span>
        </div>
      </div>
    </div>
    `
    }

    <!-- Footer: Terms and Authorized Signature & Verification QR -->
    <div class="footer-bar">
      <div class="terms-box">
        <strong>Terms & Conditions:</strong><br>
        ${terms || "Thank you for your business!"}
      </div>

      <div style="display: flex; align-items: flex-end; gap: 24px;">
        ${
          isChallan
            ? `
        <div class="signature-box" style="text-align: left;">
          <div style="height: 28px;"></div>
          <div class="signature-line">Receiver's Signature (গ্রহীতার স্বাক্ষর)</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Date & Seal / তারিখ ও সীল</div>
        </div>
        `
            : ""
        }
        <div style="text-align: center;">
          <div style="border: 1px solid #e2e8f0; padding: 3px; border-radius: 6px; background: #ffffff; display: inline-block;">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                (typeof window !== "undefined" ? window.location.origin : "https://liku.media") + "/invoice/" + (invoice.id || invoice.invoiceNumber)
              )}" 
              alt="Scan to Verify" 
              style="width: 52px; height: 52px; display: block;" 
            />
          </div>
          <div style="font-size: 8px; color: #94a3b8; font-family: monospace; margin-top: 2px;">Scan to Verify</div>
        </div>

        <div class="signature-box">
          <div style="height: 28px;"></div>
          <div class="signature-line">Authorized Signature</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Liku Media Accounts</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
