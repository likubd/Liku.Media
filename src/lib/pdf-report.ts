import { formatBdt } from "@/components/sms/sms-management";

export interface SmsPdfReportOptions {
  title: string;
  websiteName?: string;
  domain?: string;
  dateRangeText: string;
  logs: any[];
}

export function printSmsPdfReport(options: SmsPdfReportOptions) {
  const { title, websiteName = "All Websites", domain, dateRangeText, logs } = options;

  const totalSent = logs.filter((l) => l.status === "Sent").length;
  const totalCharge = logs.reduce((acc, curr) => acc + (curr.charge || 0), 0);
  const nowFormatted = new Date().toLocaleString();

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("পপ-আপ ব্লক করা রয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ রিলিজ করুন।");
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${websiteName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 30px;
      font-size: 12px;
      line-height: 1.5;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e11d48;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }

    .brand-subtitle {
      font-size: 10px;
      font-weight: 700;
      color: #e11d48;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .report-meta {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }

    .report-title-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #e11d48;
      padding: 14px 18px;
      border-radius: 6px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .report-title-text {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    .date-badge {
      background: #e11d48;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 14px;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }

    .stat-value.primary {
      color: #e11d48;
    }

    .stat-value.emerald {
      color: #059669;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 11px;
    }

    th {
      background: #0f172a;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    .status-sent {
      color: #059669;
      font-weight: 700;
      background: #ecfdf5;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid #a7f3d0;
      display: inline-block;
    }

    .status-failed {
      color: #dc2626;
      font-weight: 700;
      background: #fef2f2;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid #fecaca;
      display: inline-block;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div>
      <div class="brand-title">Liku Media</div>
      <div class="brand-subtitle">SMS Gateway Official Statement</div>
    </div>
    <div class="report-meta">
      <div><strong>তৈরি তারিখ:</strong> ${nowFormatted}</div>
      <div><strong>ওয়েবসাইট ID/Domain:</strong> ${domain || websiteName}</div>
    </div>
  </div>

  <div class="report-title-box">
    <div>
      <div class="report-title-text">${title} — ${websiteName}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">অফিসিয়াল এসএমএস হিস্ট্রি ও চার্জের রিপোর্ট</div>
    </div>
    <div class="date-badge">${dateRangeText}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label font-semibold">মোট রেকর্ড (Total Records)</div>
      <div class="stat-value">${logs.length} টি</div>
    </div>
    <div class="stat-card">
      <div class="stat-label font-semibold">সফলভাবে প্রেরিত (Sent SMS)</div>
      <div class="stat-value emerald">${totalSent} টি</div>
    </div>
    <div class="stat-card">
      <div class="stat-label font-semibold">মোট সার্ভিস খরচ (Total BDT)</div>
      <div class="stat-value primary">${formatBdt(totalCharge)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 18%;">তারিখ ও সময়</th>
        <th style="width: 15%;">প্রাপকের নম্বর</th>
        <th style="width: 37%;">মেসেজ কন্টেন্ট</th>
        <th style="width: 8%;">পার্টস</th>
        <th style="width: 9%;">স্ট্যাটাস</th>
        <th style="width: 8%; text-align: right;">চার্জ</th>
      </tr>
    </thead>
    <tbody>
      ${
        logs.length === 0
          ? `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #94a3b8;">কোনো এসএমএস হিস্ট্রি পাওয়া যায়নি।</td></tr>`
          : logs
              .map(
                (log, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${new Date(log.sentAt).toLocaleString()}</td>
          <td style="font-family: monospace; font-weight: 600;">${log.recipient}</td>
          <td>${log.message}</td>
          <td style="font-family: monospace;">${log.smsCount || 1} P</td>
          <td>
            <span class="${log.status === "Sent" ? "status-sent" : "status-failed"}">
              ${log.status}
            </span>
          </td>
          <td style="text-align: right; font-weight: 700; color: #059669;">
            ${formatBdt(log.charge || 0)}
          </td>
        </tr>
      `
              )
              .join("")
      }
    </tbody>
  </table>

  <div class="footer">
    <div>Liku Media Cloud Control Center • +880 1850290529</div>
    <div>crafted from ❤️ Rangpur</div>
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
