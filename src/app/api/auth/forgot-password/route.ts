import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ADMIN_EMAIL = "admin@fixisecurity.com";
const OTP_FILE = path.join(process.cwd(), "data", "otp.json");

// ── Helpers ──────────────────────────────────────────────────────────────────
function readOtpStore(): { otp: string; expiry: number; email: string } | null {
  try {
    if (!fs.existsSync(OTP_FILE)) return null;
    return JSON.parse(fs.readFileSync(OTP_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function writeOtpStore(data: { otp: string; expiry: number; email: string }) {
  const dir = path.dirname(OTP_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OTP_FILE, JSON.stringify(data, null, 2));
}

function clearOtpStore() {
  if (fs.existsSync(OTP_FILE)) fs.unlinkSync(OTP_FILE);
}

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
// Actions:
//   step=request  → validate email, generate OTP, return it (dev mode)
//   step=verify   → verify OTP is correct and not expired
//   step=reset    → set new password (persisted in env/data/admin.json)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step } = body;

    // ─── Step 1: Request OTP ────────────────────────────────────────────────
    if (step === "request") {
      const { email } = body;
      if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
      if (email.toLowerCase() !== ADMIN_EMAIL)
        return NextResponse.json({ error: "No account found with this email." }, { status: 404 });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 min
      writeOtpStore({ otp, expiry, email: email.toLowerCase() });

      // In production you'd send this via email. For now we return it (dev mode).
      return NextResponse.json({
        success: true,
        message: "OTP sent to the registered email.",
        // DEV ONLY — remove in production:
        _devOtp: otp,
      });
    }

    // ─── Step 2: Verify OTP ─────────────────────────────────────────────────
    if (step === "verify") {
      const { otp } = body;
      if (!otp) return NextResponse.json({ error: "OTP is required" }, { status: 400 });

      const store = readOtpStore();
      if (!store) return NextResponse.json({ error: "No OTP requested. Please start over." }, { status: 400 });
      if (Date.now() > store.expiry) {
        clearOtpStore();
        return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
      }
      if (otp !== store.otp)
        return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 });

      return NextResponse.json({ success: true, message: "OTP verified." });
    }

    // ─── Step 3: Reset Password ─────────────────────────────────────────────
    if (step === "reset") {
      const { otp, newPassword } = body;
      if (!otp || !newPassword)
        return NextResponse.json({ error: "OTP and new password are required." }, { status: 400 });

      const store = readOtpStore();
      if (!store) return NextResponse.json({ error: "Session expired. Please start over." }, { status: 400 });
      if (Date.now() > store.expiry) {
        clearOtpStore();
        return NextResponse.json({ error: "OTP has expired. Please start over." }, { status: 400 });
      }
      if (otp !== store.otp)
        return NextResponse.json({ error: "Invalid OTP. Cannot reset password." }, { status: 400 });
      if (newPassword.length < 6)
        return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

      // Persist new password to data/admin.json for future logins to read
      const adminFile = path.join(process.cwd(), "data", "admin.json");
      fs.writeFileSync(adminFile, JSON.stringify({ email: store.email, password: newPassword }, null, 2));

      clearOtpStore();
      return NextResponse.json({ success: true, message: "Password reset successfully. You can now log in." });
    }

    return NextResponse.json({ error: "Invalid step." }, { status: 400 });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
