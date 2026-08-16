import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/server-storage";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CONFIG_FILENAME = "sms_config.json";

async function getMasterApiKey(): Promise<string> {
  // 1. Try serverless-safe JSON storage
  try {
    const config = readJsonFile<any>(CONFIG_FILENAME, null);
    if (config && config.providerApiKey && config.providerApiKey.trim()) {
      return config.providerApiKey.trim();
    }
  } catch (err) {
    console.error("Error reading sms_config.json:", err);
  }

  // 2. Try Environment Variable (Vercel / Cloud Host)
  if (process.env.SMS_NET_BD_API_KEY && process.env.SMS_NET_BD_API_KEY.trim()) {
    return process.env.SMS_NET_BD_API_KEY.trim();
  }

  // 3. Try Firestore
  try {
    const masterDoc = await getDoc(doc(db, "sms_settings", "master"));
    if (masterDoc.exists() && masterDoc.data()?.providerApiKey) {
      return masterDoc.data().providerApiKey.trim();
    }
  } catch (err) {
    console.warn("Error reading Firestore sms_settings/master:", err);
  }

  return "";
}

export async function GET() {
  try {
    const masterApiKey = await getMasterApiKey();

    if (!masterApiKey || masterApiKey === "" || masterApiKey === "YOUR_API_KEY") {
      return NextResponse.json({
        configured: false,
        balance: "API Key দেওয়া হয়নি",
        msg: "মাস্টার API Key দেওয়া হয়নি। প্রোভাইডার সেটিংস থেকে অথবা Vercel Environment variables এ SMS_NET_BD_API_KEY দিন।",
      });
    }

    const cleanKey = masterApiKey.trim();
    const res = await fetch(`https://api.sms.net.bd/user/balance/?api_key=${encodeURIComponent(cleanKey)}`, {
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
