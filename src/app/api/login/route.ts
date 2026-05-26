import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: "System authentication is not configured" }, { status: 500 });
    }

    if (password === adminPassword) {
      // Generate dynamic secure session token signed with the ADMIN_PASSWORD using HMAC-SHA256
      const timestamp = Date.now().toString();
      const signature = crypto
        .createHmac("sha256", adminPassword)
        .update(timestamp)
        .digest("hex");
      const token = `${timestamp}.${signature}`;

      return NextResponse.json({ success: true, token });
    } else {
      return NextResponse.json({ success: false, error: "Invalid Admin Access Key" }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
