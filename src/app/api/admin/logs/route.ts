import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/server-storage";

const LOGS_FILENAME = "sms_logs.json";

export async function GET() {
  try {
    const logs = readJsonFile<any[]>(LOGS_FILENAME, []);
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
