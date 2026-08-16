import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/server-storage";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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

    // Save using serverless-safe storage (/tmp on Vercel, src/data in local)
    writeJsonFile(CONFIG_FILENAME, newConfig);

    // Try Firestore update (non-blocking ignore)
    try {
      const masterRef = doc(db, "sms_settings", "master");
      await setDoc(masterRef, {
        providerApiKey: newConfig.providerApiKey,
        providerSenderId: newConfig.providerSenderId,
        defaultRate: newConfig.defaultRate,
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn("Firestore save warning (ignored):", fsErr);
    }

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
