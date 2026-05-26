import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || !token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      return NextResponse.json({ success: false, error: "Invalid Token Format" }, { status: 401 });
    }

    const [timestamp, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", adminPassword)
      .update(timestamp)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: "Invalid Token Signature" }, { status: 401 });
    }

    // Verify expiration (24 hours = 86400000 ms)
    const tokenTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    if (currentTime - tokenTime > 86400000) {
      return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
