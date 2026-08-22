import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("api_key") || searchParams.get("key") || "";

  // Dynamic JS SDK code that will execute on third-party client websites
  const jsSdkContent = `
(function() {
  const apiKey = "${apiKey}";
  if (!apiKey) {
    console.warn("[Liku Media SMS SDK] Missing api_key parameter in script tag.");
    return;
  }

  const currentScript = document.currentScript;
  const baseUrl = currentScript ? new URL(currentScript.src).origin : "http://localhost:3000";

  async function checkLikuSmsNotice() {
    try {
      const res = await fetch(baseUrl + "/api/v1/status?api_key=" + encodeURIComponent(apiKey));
      const data = await res.json();

      if (!data.success) return;

      const payload = data.data;

      // Handle Blocked Account Modal
      if (payload.is_blocked || payload.status === "blocked" || payload.status === "terminated") {
        renderModal({
          title: "🔴 এসএমএস সিস্টেম নোটিশ: অ্যাকাউন্ট ব্লকড",
          message: "আপনার ওয়েবসাইট ইন্টিগ্রেশন অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে। সার্ভিস চালু করতে এডমিনের সাথে যোগাযোগ করুন।",
          type: "urgent"
        });
        return;
      }

      // Handle Admin Notice Modal
      if (payload.notice && payload.notice.enabled && payload.notice.text) {
        renderModal({
          title: "🔔 এসএমএস সিস্টেম নোটিশ",
          message: payload.notice.text,
          type: payload.notice.type || "info"
        });
      }
    } catch (err) {
      console.error("[Liku Media SMS SDK] Failed to check status:", err);
    }
  }

  function renderModal(options) {
    if (document.getElementById("liku-sms-notice-modal")) return;

    const modal = document.createElement("div");
    modal.id = "liku-sms-notice-modal";
    
    // Style settings based on notice type
    let headerBg = "linear-gradient(135deg, #1e293b, #0f172a)";
    let borderCol = "#3b82f6";
    let accentCol = "#60a5fa";

    if (options.type === "warning") {
      headerBg = "linear-gradient(135deg, #78350f, #451a03)";
      borderCol = "#f59e0b";
      accentCol = "#fbbf24";
    } else if (options.type === "urgent") {
      headerBg = "linear-gradient(135deg, #881337, #4c0519)";
      borderCol = "#f43f5e";
      accentCol = "#fb7185";
    }

    modal.style.cssText = \`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      max-width: 420px;
      width: calc(100% - 48px);
      background: #090d16;
      color: #ffffff;
      border: 1px solid \${borderCol};
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px \${borderCol}33;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 18px;
      box-sizing: border-box;
      animation: likuSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    \`;

    const keyframeStyle = document.createElement("style");
    keyframeStyle.innerHTML = \`
      @keyframes likuSlideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    \`;
    document.head.appendChild(keyframeStyle);

    modal.innerHTML = \`
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="font-weight: 700; font-size: 14px; color: \${accentCol}; display: flex; align-items: center; gap: 6px;">
          \${options.title}
        </div>
        <button id="liku-sms-modal-close" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
      </div>
      <div style="font-size: 13px; color: #e2e8f0; line-height: 1.6; margin-bottom: 12px;">
        \${options.message}
      </div>
      <div style="text-align: right; font-size: 10px; color: #64748b; font-weight: 600;">
        Powered by Liku Media SMS Gateway
      </div>
    \`;

    document.body.appendChild(modal);

    document.getElementById("liku-sms-modal-close").onclick = function() {
      modal.remove();
    };
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(checkLikuSmsNotice, 500);
  } else {
    document.addEventListener("DOMContentLoaded", checkLikuSmsNotice);
  }
})();
  `;

  return new NextResponse(jsSdkContent, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
