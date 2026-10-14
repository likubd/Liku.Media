import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/qr?data=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");

  if (!data) {
    return new NextResponse("Missing data parameter", { status: 400 });
  }

  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data)}`;
    const res = await fetch(qrUrl);
    if (!res.ok) {
      return new NextResponse("Failed to generate QR", { status: 502 });
    }

    const imageBuffer = await res.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || "QR Generation error", { status: 500 });
  }
}
