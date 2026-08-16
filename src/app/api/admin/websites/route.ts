import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { generateApiKey } from "@/lib/sms";

const WEBSITES_FILE_PATH = path.join(process.cwd(), "src", "data", "sms_websites.json");

function getLocalWebsites(): any[] {
  try {
    if (fs.existsSync(WEBSITES_FILE_PATH)) {
      const data = fs.readFileSync(WEBSITES_FILE_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading sms_websites.json:", err);
  }
  return [];
}

function saveLocalWebsites(websites: any[]) {
  try {
    const dir = path.dirname(WEBSITES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(WEBSITES_FILE_PATH, JSON.stringify(websites, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving sms_websites.json:", err);
  }
}

// GET /api/admin/websites
export async function GET() {
  try {
    const websites = getLocalWebsites();
    return NextResponse.json({ success: true, data: websites });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save locally (100% reliable)
    const websites = getLocalWebsites();
    websites.unshift(websiteData);
    saveLocalWebsites(websites);

    // Async try Firestore
    try {
      await setDoc(doc(db, "sms_websites", siteId), {
        ...websiteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn("Firestore save warning (ignored):", fsErr);
    }

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

    const websites = getLocalWebsites();
    const index = websites.findIndex((w: any) => w.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }

    const currentSite = websites[index];
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

    websites[index] = { ...currentSite, ...updatePayload };
    saveLocalWebsites(websites);

    // Async try Firestore
    try {
      await updateDoc(doc(db, "sms_websites", id), {
        ...updatePayload,
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn("Firestore update warning (ignored):", fsErr);
    }

    return NextResponse.json({
      success: true,
      msg: "Website updated successfully",
      data: websites[index],
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

    let websites = getLocalWebsites();
    websites = websites.filter((w: any) => w.id !== id);
    saveLocalWebsites(websites);

    // Async try Firestore
    try {
      await deleteDoc(doc(db, "sms_websites", id));
    } catch (fsErr) {
      console.warn("Firestore delete warning (ignored):", fsErr);
    }

    return NextResponse.json({ success: true, msg: "Website deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/admin/websites error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to delete website" }, { status: 500 });
  }
}
