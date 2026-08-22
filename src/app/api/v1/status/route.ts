import { NextRequest, NextResponse } from "next/server";
import { firestoreRestGetCollection } from "@/lib/firestore-rest";
import { readJsonFile } from "@/lib/server-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const WEBSITES_FILENAME = "sms_websites.json";

async function handleCheckStatus(apiKey: string | null) {
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      { error: 405, msg: "Authorization required. Missing api_key parameter." },
      { status: 405 }
    );
  }

  const cleanKey = apiKey.trim();

  // Try Cloud Firestore REST API first
  let websiteDoc: any = null;
  const cloudWebsites = await firestoreRestGetCollection("sms_websites");
  if (cloudWebsites && Array.isArray(cloudWebsites)) {
    websiteDoc = cloudWebsites.find((w: any) => w.apiKey === cleanKey);
  }

  if (!websiteDoc) {
    const localWebsites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
    websiteDoc = localWebsites.find((w: any) => w.apiKey === cleanKey);
  }

  if (!websiteDoc) {
    return NextResponse.json(
      { error: 403, msg: "Invalid API Key. Permission denied." },
      { status: 403 }
    );
  }

  const isBlocked = websiteDoc.status === "blocked";
  const isPaused = websiteDoc.status === "paused";
  const isTerminated = websiteDoc.status === "terminated";
  const isActive = websiteDoc.status === "active";

  const noticeData = {
    enabled: Boolean(websiteDoc.noticeEnabled),
    text: websiteDoc.noticeText || "",
    type: websiteDoc.noticeType || "info",
  };

  return NextResponse.json({
    error: isBlocked || isTerminated ? 403 : isPaused ? 411 : 0,
    msg: isBlocked 
      ? "Account is blocked (ব্লকড)। Contact administrator for support."
      : isTerminated
      ? "Account is terminated (টারমিনেট)। Access denied."
      : isPaused
      ? "Account is paused (পজ)। SMS services temporarily paused."
      : "Account is active",
    data: {
      website_id: websiteDoc.id,
      website_name: websiteDoc.name,
      domain: websiteDoc.domain || "",
      status: websiteDoc.status || "active",
      is_blocked: isBlocked,
      is_active: isActive,
      balance: Number(websiteDoc.balance || 0),
      rate_per_sms: Number(websiteDoc.ratePerSms || 0.35),
      total_sent: websiteDoc.totalSent || 0,
      client_phone: websiteDoc.clientPhone || "",
      notice: noticeData,
    },
  });
}

// GET /api/v1/status?api_key=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const apiKey = searchParams.get("api_key");
    return await handleCheckStatus(apiKey);
  } catch (err: any) {
    console.error("GET /api/v1/status error:", err);
    return NextResponse.json({ error: 409, msg: err.message || "Server error" }, { status: 500 });
  }
}

// POST /api/v1/status
export async function POST(req: NextRequest) {
  try {
    let apiKey: string | null = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      apiKey = body.api_key || null;
    } else {
      const formData = await req.formData();
      apiKey = (formData.get("api_key") as string) || null;
    }

    return await handleCheckStatus(apiKey);
  } catch (err: any) {
    console.error("POST /api/v1/status error:", err);
    return NextResponse.json({ error: 409, msg: err.message || "Server error" }, { status: 500 });
  }
}
