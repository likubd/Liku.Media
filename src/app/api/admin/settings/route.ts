import { NextRequest, NextResponse } from "next/server";
import { 
  firestoreRestGetDocument, 
  firestoreRestSetDocument 
} from "@/lib/firestore-rest";
import { readJsonFile, writeJsonFile } from "@/lib/server-storage";

const CONFIG_FILENAME = "sms_config.json";

interface SmsConfig {
  providerApiKey: string;
  providerSenderId: string;
  defaultRate: number;
  updatedAt?: string;
}

// GET /api/admin/settings
export async function GET() {
  try {
    // 1. Try Cloud Firestore REST API
    const remoteDoc = await firestoreRestGetDocument("sms_settings", "master");
    if (remoteDoc && remoteDoc.providerApiKey) {
      writeJsonFile(CONFIG_FILENAME, remoteDoc);
      return NextResponse.json({ success: true, data: remoteDoc });
    }

    // 2. Try Local File / Env
    const fallback: SmsConfig = {
      providerApiKey: process.env.SMS_NET_BD_API_KEY || "",
      providerSenderId: "",
      defaultRate: 0.35,
    };
    const config = readJsonFile<SmsConfig>(CONFIG_FILENAME, fallback);
    if (!config.providerApiKey && process.env.SMS_NET_BD_API_KEY) {
      config.providerApiKey = process.env.SMS_NET_BD_API_KEY;
    }
    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    const fallback: SmsConfig = {
      providerApiKey: process.env.SMS_NET_BD_API_KEY || "",
      providerSenderId: "",
      defaultRate: 0.35,
    };
    return NextResponse.json({ success: true, data: readJsonFile(CONFIG_FILENAME, fallback) });
  }
}

// POST /api/admin/settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerApiKey, providerSenderId, defaultRate } = body;

    const newConfig: SmsConfig = {
      providerApiKey: (providerApiKey || "").trim(),
      providerSenderId: (providerSenderId || "").trim(),
      defaultRate: Number(defaultRate) || 0.35,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to Cloud Firestore via REST API
    await firestoreRestSetDocument("sms_settings", "master", newConfig);

    // 2. Save to local storage
    writeJsonFile(CONFIG_FILENAME, newConfig);

    return NextResponse.json({
      success: true,
      msg: "Master settings saved successfully",
      data: newConfig,
    });
  } catch (err: any) {
    console.error("POST /api/admin/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
