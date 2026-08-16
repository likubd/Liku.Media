import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOGS_FILE_PATH = path.join(process.cwd(), "src", "data", "sms_logs.json");

export async function GET() {
  try {
    let logs: any[] = [];
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const data = fs.readFileSync(LOGS_FILE_PATH, "utf8");
      logs = JSON.parse(data);
    }
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
