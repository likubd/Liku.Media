import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const apiKey = searchParams.get("api_key");
    const requestId = searchParams.get("id");

    if (!apiKey) {
      return NextResponse.json(
        { error: 405, msg: "Authorization required. Missing api_key parameter." },
        { status: 405 }
      );
    }
    if (!requestId) {
      return NextResponse.json(
        { error: 400, msg: "Missing request id parameter." },
        { status: 400 }
      );
    }

    const masterDoc = await getDoc(doc(db, "sms_settings", "master"));
    const masterApiKey = masterDoc.exists()
      ? masterDoc.data()?.providerApiKey
      : process.env.SMS_NET_BD_API_KEY;

    if (!masterApiKey) {
      return NextResponse.json(
        { error: 409, msg: "Master Provider API key not configured." },
        { status: 500 }
      );
    }

    // Proxy request to sms.net.bd report endpoint
    const url = `https://api.sms.net.bd/report/request/${requestId}/?api_key=${masterApiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 409, msg: err.message || "Server Error" }, { status: 500 });
  }
}
