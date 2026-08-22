import { NextRequest, NextResponse } from "next/server";
import { 
  firestoreRestGetCollection, 
  firestoreRestGetDocument, 
  firestoreRestSetDocument 
} from "@/lib/firestore-rest";
import { readJsonFile, writeJsonFile } from "@/lib/server-storage";
import { calculateSmsUnits, normalizePhoneNumbers } from "@/lib/sms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CONFIG_FILENAME = "sms_config.json";
const WEBSITES_FILENAME = "sms_websites.json";
const LOGS_FILENAME = "sms_logs.json";

// Upstream Provider Endpoint
const PROVIDER_SEND_SMS_URL = "https://api.sms.net.bd/sendsms";

// Friendly Bengali explanation for sms.net.bd error codes
const SMS_NET_BD_ERRORS: Record<number, string> = {
  0: "সফলভাবে গৃহীত হয়েছে (Success)",
  400: "অনুরোধে সঠিক প্যারামিটার নেই (Error 400: Invalid parameters)",
  403: "অনুমতি নেই বা API Key ভুল (Error 403: Permissions denied)",
  404: "রিসোর্স পাওয়া যায়নি (Error 404: Not found)",
  405: "API Key প্রয়োজন (Error 405: Authorization required)",
  409: "সার্ভারে অজানা ত্রুটি ঘটেছে (Error 409: Server error)",
  410: "sms.net.bd অ্যাকাউন্টের মেয়াদ শেষ (Error 410: Account expired)",
  411: "sms.net.bd অ্যাকাউন্ট সাসপেন্ড করা হয়েছে (Error 411: Account suspended)",
  412: "অবৈধ শিডিউল সময় (Error 412: Invalid Schedule)",
  413: "অবৈধ Sender ID! অনুমোদিত Sender ID না থাকলে এটি খালি রাখুন (Error 413: Invalid Sender ID)",
  414: "মেসেজ খালি (Error 414: Message empty)",
  415: "মেসেজ খুব বড় (Error 415: Message too long)",
  416: "সঠিক প্রাপকের ফোন নম্বর পাওয়া যায়নি (Error 416: No valid number found)",
  417: "sms.net.bd প্রোভাইডার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই! (Error 417: Insufficient provider balance)",
  420: "মেসেজের কন্টেন্ট ব্লক করা হয়েছে (Error 420: Content Blocked)",
  421: "প্রথম রিচার্জের আগে শুধুমাত্র আপনার রেজিস্টার্ড নম্বরে SMS পাঠাতে পারবেন (Error 421)",
};

async function getMasterSettings() {
  const remoteSettings = await firestoreRestGetDocument("sms_settings", "master");
  if (remoteSettings && remoteSettings.providerApiKey) {
    return remoteSettings;
  }

  const fallback = {
    providerApiKey: process.env.SMS_NET_BD_API_KEY || "",
    providerSenderId: "",
    defaultRate: 0.35,
  };

  const config = readJsonFile<any>(CONFIG_FILENAME, fallback);
  if (!config.providerApiKey && process.env.SMS_NET_BD_API_KEY) {
    config.providerApiKey = process.env.SMS_NET_BD_API_KEY;
  }

  return config;
}

async function handleSendSms(params: {
  api_key?: string;
  msg?: string;
  to?: string;
  schedule?: string;
  sender_id?: string;
  content_id?: string;
  source?: "API" | "Dashboard";
}) {
  const { api_key, msg, to, schedule, sender_id, content_id, source = "API" } = params;

  // 1. Parameter Validation
  if (!api_key) {
    return NextResponse.json(
      { error: 405, msg: "Authorization required. Missing api_key parameter." },
      { status: 405 }
    );
  }
  if (!msg || msg.trim().length === 0) {
    return NextResponse.json(
      { error: 414, msg: "Message is empty." },
      { status: 400 }
    );
  }
  if (!to || to.trim().length === 0) {
    return NextResponse.json(
      { error: 416, msg: "No valid recipient phone number found." },
      { status: 400 }
    );
  }

  // 2. Lookup Website Account by API Key
  let websiteDoc: any = null;
  let isMasterKey = false;

  const masterSettings = await getMasterSettings();
  const masterApiKey = masterSettings.providerApiKey || process.env.SMS_NET_BD_API_KEY;

  if (masterApiKey && api_key === masterApiKey) {
    isMasterKey = true;
  } else {
    // Try Cloud Firestore REST API first
    const cloudWebsites = await firestoreRestGetCollection("sms_websites");
    websiteDoc = cloudWebsites.find((w: any) => w.apiKey === api_key);

    if (!websiteDoc) {
      // Fallback to local storage
      const localWebsites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
      websiteDoc = localWebsites.find((w: any) => w.apiKey === api_key);
    }

    if (!websiteDoc) {
      return NextResponse.json(
        { error: 403, msg: "You don't have permissions to perform the request. Invalid API Key." },
        { status: 403 }
      );
    }
  }

  // 3. Verify Account Status if website key
  if (!isMasterKey && websiteDoc) {
    if (websiteDoc.status === "blocked") {
      return NextResponse.json(
        { 
          error: 420, 
          msg: "Account is blocked (ব্লকড)। কাস্টমার সহায়তা সেন্টারে যোগাযোগ করুন।",
          notice: websiteDoc.noticeEnabled ? { text: websiteDoc.noticeText, type: websiteDoc.noticeType } : null
        },
        { status: 403 }
      );
    }
    if (websiteDoc.status === "paused") {
      return NextResponse.json(
        { 
          error: 411, 
          msg: "Account is paused (পজ করা রয়েছে)। মেসেজ পাঠানো যাবে না।",
          notice: websiteDoc.noticeEnabled ? { text: websiteDoc.noticeText, type: websiteDoc.noticeType } : null
        },
        { status: 403 }
      );
    }
    if (websiteDoc.status === "terminated") {
      return NextResponse.json(
        { 
          error: 403, 
          msg: "Account has been terminated (টারমিনেট করা হয়েছে)। Access denied.",
          notice: websiteDoc.noticeEnabled ? { text: websiteDoc.noticeText, type: websiteDoc.noticeType } : null
        },
        { status: 403 }
      );
    }
  }

  // 4. Calculate Recipients and SMS Parts
  const phoneList = normalizePhoneNumbers(to);
  if (phoneList.length === 0) {
    return NextResponse.json(
      { error: 416, msg: "No valid recipient phone number found after formatting." },
      { status: 400 }
    );
  }

  const formattedTo = phoneList.join(",");
  const calcResult = calculateSmsUnits(msg);
  const totalParts = calcResult.parts * phoneList.length;

  const ratePerSms = !isMasterKey && websiteDoc ? (websiteDoc.ratePerSms ?? masterSettings.defaultRate ?? 0.35) : 0;
  const totalCost = Number((totalParts * ratePerSms).toFixed(4));

  // 5. Check Balance if website key
  if (!isMasterKey && websiteDoc) {
    const currentBalance = Number(websiteDoc.balance ?? 0);
    if (currentBalance < totalCost) {
      return NextResponse.json(
        {
          error: 417,
          msg: `Insufficient balance (অপর্যাপ্ত ব্যালেন্স)। Required: ৳${totalCost}, Available: ৳${currentBalance}`,
        },
        { status: 400 }
      );
    }
  }

  // 6. Upstream Provider Request (sms.net.bd)
  if (!masterApiKey || masterApiKey.trim() === "" || masterApiKey === "YOUR_API_KEY") {
    return NextResponse.json(
      {
        error: 405,
        msg: "sms.net.bd এর মাস্টার API Key সেটিংসে অথবা Vercel Environment variables এ বসানো হয়নি।",
      },
      { status: 500 }
    );
  }

  let providerResponseText = "";
  let providerResult: any = null;

  const postParams = new URLSearchParams();
  postParams.append("api_key", masterApiKey.trim());
  postParams.append("msg", msg);
  postParams.append("to", formattedTo);
  if (schedule && schedule.trim()) postParams.append("schedule", schedule.trim());

  const activeSenderId = (sender_id || masterSettings.providerSenderId || "").trim();
  if (activeSenderId && activeSenderId !== "Sender ID" && activeSenderId !== "Approved Masking Sender ID") {
    postParams.append("sender_id", activeSenderId);
  }
  if (content_id && content_id.trim()) postParams.append("content_id", content_id.trim());

  try {
    let response = await fetch(PROVIDER_SEND_SMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postParams.toString(),
    });

    providerResponseText = await response.text();

    try {
      providerResult = JSON.parse(providerResponseText);
    } catch {
      providerResult = null;
    }

    if (!providerResult || providerResult.error !== 0) {
      const getUrl = `${PROVIDER_SEND_SMS_URL}?${postParams.toString()}`;
      const getRes = await fetch(getUrl, { method: "GET" });
      const getResText = await getRes.text();
      try {
        const getResult = JSON.parse(getResText);
        if (getResult && typeof getResult.error === "number") {
          providerResult = getResult;
          providerResponseText = getResText;
        }
      } catch {
        // keep previous
      }
    }
  } catch (err: any) {
    console.error("Upstream provider call error:", err);
    return NextResponse.json(
      { error: 409, msg: `Failed to communicate with SMS provider: ${err.message}` },
      { status: 500 }
    );
  }

  const isSuccess = providerResult && providerResult.error === 0;
  const rawErrorCode = providerResult?.error ?? 409;
  const friendlyErrorMsg =
    SMS_NET_BD_ERRORS[rawErrorCode] || providerResult?.msg || providerResponseText || "Provider Error";

  // 7. Update Balance & Log Transaction
  if (isSuccess && !isMasterKey && websiteDoc) {
    const remainingBalance = Number((websiteDoc.balance - totalCost).toFixed(4));
    const updatedSite = {
      ...websiteDoc,
      balance: remainingBalance,
      totalSent: (websiteDoc.totalSent || 0) + phoneList.length,
      totalSpent: Number(((websiteDoc.totalSpent || 0) + totalCost).toFixed(4)),
      updatedAt: new Date().toISOString(),
    };

    // Update Cloud Firestore via REST API
    await firestoreRestSetDocument("sms_websites", websiteDoc.id, updatedSite);

    // Update Local storage
    const localWebsites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
    const localIdx = localWebsites.findIndex((w: any) => w.id === websiteDoc.id);
    if (localIdx >= 0) {
      localWebsites[localIdx] = updatedSite;
      writeJsonFile(WEBSITES_FILENAME, localWebsites);
    }
  }

  // Record Log Entry
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const logData = {
    id: logId,
    websiteId: isMasterKey ? "master" : (websiteDoc?.id || "unknown"),
    websiteName: isMasterKey ? "Master Admin" : (websiteDoc?.name || "Website"),
    apiKey: api_key.substring(0, 12) + "...",
    recipient: formattedTo,
    message: msg,
    smsCount: calcResult.parts,
    totalRecipients: phoneList.length,
    totalUnits: totalParts,
    isUnicode: calcResult.isUnicode,
    charge: totalCost,
    providerRequestId: providerResult?.data?.request_id || 0,
    status: isSuccess ? "Sent" : "Failed",
    errorMsg: isSuccess ? "" : friendlyErrorMsg,
    source: source,
    sentAt: new Date().toISOString(),
  };

  // Save log to Cloud Firestore via REST API
  await firestoreRestSetDocument("sms_logs", logId, logData);

  // Save log locally
  const localLogs = readJsonFile<any[]>(LOGS_FILENAME, []);
  localLogs.unshift(logData);
  writeJsonFile(LOGS_FILENAME, localLogs);

  // 8. Return Response
  if (isSuccess) {
    const remainingBalance = !isMasterKey && websiteDoc ? Number((websiteDoc.balance - totalCost).toFixed(4)) : null;
    const noticeObj = !isMasterKey && websiteDoc && websiteDoc.noticeEnabled ? {
      text: websiteDoc.noticeText || "",
      type: websiteDoc.noticeType || "info"
    } : null;

    return NextResponse.json({
      error: 0,
      msg: providerResult.msg || "Request successfully submitted",
      ...(noticeObj ? { notice: noticeObj } : {}),
      data: {
        request_id: providerResult.data?.request_id || 0,
        sms_parts: totalParts,
        charge: totalCost,
        ...(remainingBalance !== null ? { remaining_balance: remainingBalance } : {}),
      },
    });
  } else {
    return NextResponse.json(
      {
        error: rawErrorCode,
        msg: friendlyErrorMsg,
        raw_response: providerResponseText,
      },
      { status: 400 }
    );
  }
}

// POST /api/v1/send-sms
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      try {
        body = await req.json();
      } catch {
        const text = await req.text();
        const searchParams = new URLSearchParams(text);
        body = Object.fromEntries(searchParams.entries());
      }
    }

    return await handleSendSms(body);
  } catch (err: any) {
    console.error("POST /api/v1/send-sms error:", err);
    return NextResponse.json({ error: 409, msg: err.message || "Server Error" }, { status: 500 });
  }
}

// GET /api/v1/send-sms (URL query parameter support)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = {
      api_key: searchParams.get("api_key") || undefined,
      msg: searchParams.get("msg") || undefined,
      to: searchParams.get("to") || undefined,
      schedule: searchParams.get("schedule") || undefined,
      sender_id: searchParams.get("sender_id") || undefined,
      content_id: searchParams.get("content_id") || undefined,
    };
    return await handleSendSms(params);
  } catch (err: any) {
    console.error("GET /api/v1/send-sms error:", err);
    return NextResponse.json({ error: 409, msg: err.message || "Server Error" }, { status: 500 });
  }
}
