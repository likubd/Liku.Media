import { NextRequest, NextResponse } from "next/server";
import { 
  firestoreRestGetCollection, 
  firestoreRestSetDocument, 
  firestoreRestDeleteDocument,
  firestoreRestGetDocument 
} from "@/lib/firestore-rest";
import { readJsonFile, writeJsonFile } from "@/lib/server-storage";
import { generateApiKey } from "@/lib/sms";

const WEBSITES_FILENAME = "sms_websites.json";

// GET /api/admin/websites
export async function GET() {
  try {
    const remoteWebsites = await firestoreRestGetCollection("sms_websites");
    const localWebsites = readJsonFile<any[]>(WEBSITES_FILENAME, []);

    if (remoteWebsites && remoteWebsites.length > 0) {
      remoteWebsites.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      writeJsonFile(WEBSITES_FILENAME, remoteWebsites);
      return NextResponse.json({ success: true, data: remoteWebsites });
    }

    // Auto-sync local websites to cloud if cloud was empty
    if (localWebsites && localWebsites.length > 0) {
      for (const site of localWebsites) {
        await firestoreRestSetDocument("sms_websites", site.id, site);
      }
      return NextResponse.json({ success: true, data: localWebsites });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    const localWebsites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
    return NextResponse.json({ success: true, data: localWebsites });
  }
}

// POST /api/admin/websites
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, domain, balance, ratePerSms, clientPhone } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, error: "Website name is required." }, { status: 400 });
    }

    const apiKey = generateApiKey();
    const siteId = `site_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const websiteData = {
      id: siteId,
      name: name.trim(),
      domain: (domain || "").trim(),
      apiKey: apiKey,
      balance: Number(balance) || 0,
      ratePerSms: Number(ratePerSms) || 0.35,
      status: "active",
      totalSent: 0,
      totalSpent: 0,
      clientPhone: (clientPhone || "").trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Save to Cloud Firestore via REST API (Global Cloud Storage)
    await firestoreRestSetDocument("sms_websites", siteId, websiteData);

    // 2. Save locally
    const websites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
    websites.unshift(websiteData);
    writeJsonFile(WEBSITES_FILENAME, websites);

    return NextResponse.json({
      success: true,
      msg: "Website created successfully",
      data: websiteData,
    });
  } catch (err: any) {
    console.error("POST /api/admin/websites error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create website" }, { status: 500 });
  }
}

// PATCH /api/admin/websites
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, status, balance, ratePerSms } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing website id" }, { status: 400 });
    }

    let currentSite = await firestoreRestGetDocument("sms_websites", id);
    const websites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
    const localIndex = websites.findIndex((w: any) => w.id === id);

    if (!currentSite && localIndex >= 0) {
      currentSite = websites[localIndex];
    }

    if (!currentSite) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }

    const updatePayload: any = { updatedAt: new Date().toISOString() };

    if (action === "update_status" && status) {
      updatePayload.status = status;
    } else if (action === "update_balance" && balance !== undefined) {
      updatePayload.balance = Number(balance);
    } else if (action === "update_rate" && ratePerSms !== undefined) {
      updatePayload.ratePerSms = Number(ratePerSms);
    } else if (action === "regenerate_key") {
      updatePayload.apiKey = generateApiKey();
    } else {
      if (status) updatePayload.status = status;
      if (balance !== undefined) updatePayload.balance = Number(balance);
      if (ratePerSms !== undefined) updatePayload.ratePerSms = Number(ratePerSms);
    }

    const updatedSite = { ...currentSite, ...updatePayload };

    // 1. Save to Cloud Firestore via REST API
    await firestoreRestSetDocument("sms_websites", id, updatedSite);

    // 2. Save locally
    if (localIndex >= 0) {
      websites[localIndex] = updatedSite;
    } else {
      websites.unshift(updatedSite);
    }
    writeJsonFile(WEBSITES_FILENAME, websites);

    return NextResponse.json({
      success: true,
      msg: "Website updated successfully",
      data: updatedSite,
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/websites error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to update website" }, { status: 500 });
  }
}

// DELETE /api/admin/websites
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing website id" }, { status: 400 });
    }

    // 1. Delete from Cloud Firestore via REST API
    await firestoreRestDeleteDocument("sms_websites", id);

    // 2. Delete locally
    let websites = readJsonFile<any[]>(WEBSITES_FILENAME, []);
    websites = websites.filter((w: any) => w.id !== id);
    writeJsonFile(WEBSITES_FILENAME, websites);

    return NextResponse.json({ success: true, msg: "Website deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/admin/websites error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to delete website" }, { status: 500 });
  }
}
