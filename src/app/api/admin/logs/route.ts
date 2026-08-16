import { NextResponse } from "next/server";
import { firestoreRestGetCollection } from "@/lib/firestore-rest";
import { readJsonFile, writeJsonFile } from "@/lib/server-storage";

const LOGS_FILENAME = "sms_logs.json";

export async function GET() {
  try {
    const remoteLogs = await firestoreRestGetCollection("sms_logs");
    if (remoteLogs && remoteLogs.length > 0) {
      writeJsonFile(LOGS_FILENAME, remoteLogs);
      return NextResponse.json({ success: true, data: remoteLogs });
    }

    const localLogs = readJsonFile<any[]>(LOGS_FILENAME, []);
    return NextResponse.json({ success: true, data: localLogs });
  } catch (err: any) {
    const localLogs = readJsonFile<any[]>(LOGS_FILENAME, []);
    return NextResponse.json({ success: true, data: localLogs });
  }
}
