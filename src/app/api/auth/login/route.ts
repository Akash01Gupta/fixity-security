import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";

const ADMIN_EMAIL = "admin@fixisecurity.com";
const ADMIN_PASSWORD = "admin123";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate token for admin
    const token = signToken({ role: "admin", email });
    // console.log(token)

    return NextResponse.json({ success: true, token, role: "admin" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}