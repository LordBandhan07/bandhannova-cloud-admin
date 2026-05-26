import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: "System authentication is not configured" }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true, token: "BNC_AUTHENTICATED_SESSION_KEY_2026" });
    } else {
      return NextResponse.json({ success: false, error: "Invalid Admin Access Key" }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
