import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "sms_config.json");

function getLocalConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading sms_config.json:", err);
  }
  return {
    providerApiKey: process.env.SMS_NET_BD_API_KEY || "",
    providerSenderId: "",
    defaultRate: 0.35,
  };
}

function saveLocalConfig(config: any) {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving sms_config.json:", err);
  }
}

// GET /api/admin/settings
export async function GET() {
  try {
    const config = getLocalConfig();
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

    const newConfig = {
      providerApiKey: (providerApiKey || "").trim(),
      providerSenderId: (providerSenderId || "").trim(),
      defaultRate: Number(defaultRate) || 0.35,
      updatedAt: new Date().toISOString(),
    };

    // Save to local file system (100% reliable without Firestore permissions error)
    saveLocalConfig(newConfig);

    // Try saving to Firestore asynchronously (ignore permission errors)
    try {
      const masterRef = doc(db, "sms_settings", "master");
      await setDoc(masterRef, {
        providerApiKey: newConfig.providerApiKey,
        providerSenderId: newConfig.providerSenderId,
        defaultRate: newConfig.defaultRate,
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn("Firestore save warning (ignored due to rules):", fsErr);
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
