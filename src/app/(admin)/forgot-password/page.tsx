"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, ArrowLeft, ShieldCheck, KeyRound, Eye, EyeOff,
  CheckCircle, RefreshCw, Lock, AlertCircle
} from "lucide-react";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState(""); // shown in dev
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ── Step 1: Request OTP ──────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "request", email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (data._devOtp) setDevOtp(data._devOtp);
      setStep("otp");
      setTimer(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpStr = otp.join("");
    if (otpStr.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "verify", otp: otpStr }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("reset");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ───────────────────────────────────────────────
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "reset", otp: otp.join(""), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ────────────────────────────────────────────────────
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "request", email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (data._devOtp) setDevOtp(data._devOtp);
      setTimer(60);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    if (pwd.length < 4) return 1;
    if (pwd.length < 8) return 2;
    if (pwd.length < 12) return 3;
    return 4;
  };
  const strength = pwStrength(newPassword);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-[#00FF66]"][strength];

  const steps: { id: Step; label: string }[] = [
    { id: "email", label: "Email" },
    { id: "otp", label: "Verify" },
    { id: "reset", label: "Reset" },
  ];

  const stepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00FF66]/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00FF66]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#00FF66] transition mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {/* Card */}
        <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl shadow-[0_0_60px_rgba(0,255,102,0.06)] overflow-hidden">

          {/* Header */}
          <div className="p-8 pb-6 border-b border-[#1F3D2B]/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1F3D2B] to-[#0a0f0d] border border-[#00FF66]/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.1)]">
                <KeyRound size={22} className="text-[#00FF66]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {step === "done" ? "Password Reset!" : "Forgot Password"}
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {step === "email" && "Enter your admin email to receive an OTP."}
                  {step === "otp" && `Enter the 6-digit code sent to ${email}`}
                  {step === "reset" && "Set your new admin password."}
                  {step === "done" && "Your password has been updated successfully."}
                </p>
              </div>
            </div>

            {/* Step progress bar (hide on done) */}
            {step !== "done" && (
              <div className="flex items-center gap-0 mt-4">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        i < stepIdx
                          ? "bg-[#00FF66] border-[#00FF66] text-black"
                          : i === stepIdx
                          ? "bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66]"
                          : "bg-[#1F3D2B]/20 border-[#1F3D2B] text-zinc-600"
                      }`}>
                        {i < stepIdx ? <CheckCircle size={14} /> : i + 1}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${i === stepIdx ? "text-[#00FF66]" : "text-zinc-600"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-px mx-2 mb-4 ${i < stepIdx ? "bg-[#00FF66]/50" : "bg-[#1F3D2B]"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form body */}
          <div className="p-8">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* ── STEP 1: EMAIL ── */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Admin Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      required
                      type="email"
                      placeholder="admin@fixisecurity.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0d1a12] border border-[#1F3D2B] rounded-xl text-white pl-10 pr-4 py-3 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/20 outline-none transition placeholder:text-zinc-600 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-2">We&apos;ll send a 6-digit OTP to verify your identity.</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.2)]"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending OTP…</>
                    : <><Mail size={16} /> Send OTP</>
                  }
                </button>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {/* Dev hint box */}
                {devOtp && (
                  <div className="bg-[#00FF66]/5 border border-[#00FF66]/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Dev Mode — Your OTP</p>
                    <p className="text-2xl font-black text-[#00FF66] tracking-[0.5em] font-mono">{devOtp}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Valid for 10 minutes</p>
                  </div>
                )}

                {/* OTP input boxes */}
                <div>
                  <label className="text-xs text-zinc-400 mb-3 block font-semibold uppercase tracking-wider text-center">Enter 6-Digit OTP</label>
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-[#0d1a12] text-white outline-none transition-all ${
                          digit
                            ? "border-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.2)]"
                            : "border-[#1F3D2B] focus:border-[#00FF66]/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full py-3 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.2)]"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verifying…</>
                    : <><ShieldCheck size={16} /> Verify OTP</>
                  }
                </button>

                {/* Resend */}
                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-xs text-zinc-500">
                      Resend OTP in <span className="text-[#00FF66] font-bold">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-xs text-zinc-400 hover:text-[#00FF66] transition flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* ── STEP 3: RESET ── */}
            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      required
                      type={showNew ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0d1a12] border border-[#1F3D2B] rounded-xl text-white pl-10 pr-11 py-3 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/20 outline-none transition placeholder:text-zinc-600 text-sm"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#00FF66] transition">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="flex gap-1 mt-2 items-center">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div key={lvl} className={`h-1 flex-1 rounded-full transition-all ${strength >= lvl ? strengthColor : "bg-zinc-800"}`} />
                      ))}
                      <span className="text-[10px] text-zinc-500 ml-2 w-10">{strengthLabel}</span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      required
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-[#0d1a12] border rounded-xl text-white pl-10 pr-11 py-3 focus:ring-1 outline-none transition placeholder:text-zinc-600 text-sm ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : confirmPassword && newPassword === confirmPassword
                          ? "border-[#00FF66]/50 focus:border-[#00FF66] focus:ring-[#00FF66]/20"
                          : "border-[#1F3D2B] focus:border-[#00FF66] focus:ring-[#00FF66]/20"
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#00FF66] transition">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${newPassword === confirmPassword ? "text-[#00FF66]" : "text-red-400"}`}>
                      {newPassword === confirmPassword
                        ? <><CheckCircle size={11} /> Passwords match</>
                        : <><AlertCircle size={11} /> Passwords do not match</>
                      }
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.2)] mt-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Resetting…</>
                    : <><KeyRound size={16} /> Reset Password</>
                  }
                </button>
              </form>
            )}

            {/* ── STEP 4: DONE ── */}
            {step === "done" && (
              <div className="text-center py-4 space-y-6">
                <div className="w-20 h-20 rounded-full bg-[#00FF66]/10 border-2 border-[#00FF66]/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,255,102,0.15)]">
                  <CheckCircle size={36} className="text-[#00FF66]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">All Done!</h2>
                  <p className="text-sm text-zinc-400">Your password has been reset. You can now log in with your new credentials.</p>
                </div>
                <button
                  onClick={() => router.replace("/login")}
                  className="w-full py-3 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black font-bold rounded-xl hover:opacity-90 transition shadow-[0_0_20px_rgba(0,255,102,0.2)]"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
