import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "sms_config.json");

async function getMasterApiKey(): Promise<string> {
  // 1. Try local JSON config file
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      const json = JSON.parse(data);
      if (json.providerApiKey && json.providerApiKey.trim()) {
        return json.providerApiKey.trim();
      }
    }
  } catch (err) {
    console.error("Error reading local sms_config.json:", err);
  }

  // 2. Try Firestore
  try {
    const masterDoc = await getDoc(doc(db, "sms_settings", "master"));
    if (masterDoc.exists() && masterDoc.data()?.providerApiKey) {
      return masterDoc.data().providerApiKey.trim();
    }
  } catch (err) {
    console.warn("Error reading Firestore sms_settings/master:", err);
  }

  // 3. Try environment variable
  return (process.env.SMS_NET_BD_API_KEY || "").trim();
}

export async function GET() {
  try {
    const masterApiKey = await getMasterApiKey();

    if (!masterApiKey || masterApiKey === "" || masterApiKey === "YOUR_API_KEY") {
      return NextResponse.json({
        configured: false,
        balance: "API Key দেওয়া হয়নি",
        msg: "মাস্টার API Key দেওয়া হয়নি। প্রোভাইডার সেটিংস থেকে আসল API Key দিন।",
      });
    }

    const res = await fetch(`https://api.sms.net.bd/user/balance/?api_key=${encodeURIComponent(masterApiKey)}`, {
      cache: "no-store",
    });
    const data = await res.json();

    if (data.error === 0 && data.data && data.data.balance !== undefined) {
      return NextResponse.json({
        configured: true,
        balance: data.data.balance,
        msg: "Success",
      });
    } else {
      let friendlyReason = "API Key ভুল বা সমস্যাযুক্ত";
      if (data.error === 405 || data.error === 403) {
        friendlyReason = "ভুল API Key";
      } else if (data.error === 410) {
        friendlyReason = "অ্যাকাউন্টের মেয়াদ শেষ";
      }

      return NextResponse.json({
        configured: false,
        balance: friendlyReason,
        error: data.error,
        msg: data.msg || friendlyReason,
      });
    }
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      balance: "কানেকশন সমস্যা",
      msg: err.message || "sms.net.bd সার্ভারে যোগাযোগ করা যায়নি",
    });
  }
}
