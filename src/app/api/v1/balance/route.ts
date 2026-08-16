import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const apiKey = searchParams.get("api_key");

    if (!apiKey) {
      return NextResponse.json(
        { error: 405, msg: "Authorization required. Missing api_key parameter." },
        { status: 405 }
      );
    }

    // Check Master Key
    const masterDoc = await getDoc(doc(db, "sms_settings", "master"));
    const masterApiKey = masterDoc.exists()
      ? masterDoc.data()?.providerApiKey
      : process.env.SMS_NET_BD_API_KEY;

    if (masterApiKey && apiKey === masterApiKey) {
      // Fetch live balance from sms.net.bd
      try {
        const res = await fetch(`https://api.sms.net.bd/user/balance/?api_key=${masterApiKey}`);
        const data = await res.json();
        return NextResponse.json({
          error: 0,
          msg: "Success",
          data: {
            account_type: "Master Provider",
            balance: data.data?.balance || "00.0000",
          },
        });
      } catch {
        return NextResponse.json({
          error: 0,
          msg: "Success",
          data: { account_type: "Master Provider", balance: "Unlimited" },
        });
      }
    }

    // Lookup Website by API key
    const q = query(collection(db, "sms_websites"), where("apiKey", "==", apiKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 403, msg: "You don't have permissions to perform the request. Invalid API Key." },
        { status: 403 }
      );
    }

    const site = querySnapshot.docs[0].data();

    return NextResponse.json({
      error: 0,
      msg: "Success",
      data: {
        website_name: site.name,
        balance: (site.balance ?? 0).toFixed(4),
        rate_per_sms: (site.ratePerSms ?? 0.35).toFixed(2),
        status: site.status || "active",
        total_sent: site.totalSent || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 409, msg: err.message || "Server Error" }, { status: 500 });
  }
}
