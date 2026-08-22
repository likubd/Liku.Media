import { NextRequest, NextResponse } from "next/server";
import { firestoreRestGetCollection, firestoreRestGetDocument } from "@/lib/firestore-rest";
import { readJsonFile } from "@/lib/server-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const WEBSITES_FILENAME = "sms_websites.json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const apiKey = searchParams.get("api_key");

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        { error: 405, msg: "Authorization required. Missing api_key parameter." },
        { status: 405 }
      );
    }

    const cleanKey = apiKey.trim();

    // Check Master Key
    const remoteSettings = await firestoreRestGetDocument("sms_settings", "master");
    const masterApiKey = remoteSettings?.providerApiKey || process.env.SMS_NET_BD_API_KEY;

    if (masterApiKey && cleanKey === masterApiKey) {
      try {
        const res = await fetch(`https://api.sms.net.bd/user/balance/?api_key=${masterApiKey}`);
        const data = await res.json();
        return NextResponse.json({
          error: 0,
          msg: "Success",
          data: {
            account_type: "Master Provider",
            balance: data.data?.balance || "00.0000",
            status: "active",
            is_blocked: false,
          },
        });
      } catch {
        return NextResponse.json({
          error: 0,
          msg: "Success",
          data: { account_type: "Master Provider", balance: "Unlimited", status: "active", is_blocked: false },
        });
      }
    }

    // Lookup Website by API key via REST API
    let site: any = null;
    const cloudWebsites = await firestoreRestGetCollection("sms_websites");
    if (cloudWebsites && Array.isArray(cloudWebsites)) {
      site = cloudWebsites.find((w: any) => w.apiKey === cleanKey);
    }

    if (!site) {
      const localWebsites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
      site = localWebsites.find((w: any) => w.apiKey === cleanKey);
    }

    if (!site) {
      return NextResponse.json(
        { error: 403, msg: "You don't have permissions to perform the request. Invalid API Key." },
        { status: 403 }
      );
    }

    const isBlocked = site.status === "blocked";

    return NextResponse.json({
      error: isBlocked ? 403 : 0,
      msg: isBlocked ? "Account is blocked (ব্লকড)" : "Success",
      data: {
        website_name: site.name,
        domain: site.domain || "",
        balance: (site.balance ?? 0).toFixed(4),
        rate_per_sms: (site.ratePerSms ?? 0.35).toFixed(2),
        status: site.status || "active",
        is_blocked: isBlocked,
        total_sent: site.totalSent || 0,
        notice: {
          enabled: Boolean(site.noticeEnabled),
          text: site.noticeText || "",
          type: site.noticeType || "info",
        },
      },
    });
  } catch (err: any) {
    console.error("GET /api/v1/balance error:", err);
    return NextResponse.json({ error: 409, msg: err.message || "Server Error" }, { status: 500 });
  }
}
