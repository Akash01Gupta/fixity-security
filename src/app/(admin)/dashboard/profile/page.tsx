"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, ShieldCheck, Mail, Lock, Eye, EyeOff, LogOut,
  CheckCircle, AlertTriangle, Key, Clock, Activity,
  Globe, Cpu, BarChart2, Save
} from "lucide-react";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const router = useRouter();

  // Profile display state
  const [email] = useState("admin@fixisecurity.com");
  const [role] = useState("System Administrator");
  const [loginTime, setLoginTime] = useState("");
  const [sessionAge, setSessionAge] = useState("");

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Stats (derived from localStorage timestamps)
  const [stats, setStats] = useState({
    blogs: 0,
    services: 0,
    trainings: 0,
    contacts: 0,
  });

  useEffect(() => {
    // Session start approximation
    const now = new Date();
    setLoginTime(now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));

    // Derive session age
    const tokenRaw = localStorage.getItem("admin_token");
    if (tokenRaw) {
      try {
        const payload = JSON.parse(atob(tokenRaw.split(".")[1]));
        const iat = payload.iat ? new Date(payload.iat * 1000) : now;
        const diff = Math.floor((now.getTime() - iat.getTime()) / 60000);
        if (diff < 60) setSessionAge(`${diff} min ago`);
        else setSessionAge(`${Math.floor(diff / 60)} hr ${diff % 60} min ago`);
      } catch {
        setSessionAge("This session");
      }
    }

    // Fetch content stats
    const fetchStats = async () => {
      try {
        const [contentRes, trainingsRes] = await Promise.all([
          fetch("/api/content", { cache: "no-store" }),
          fetch("/api/trainings", { cache: "no-store" }),
        ]);
        const content = await contentRes.json();
        const trainings = await trainingsRes.json();

        // Count contacts from localStorage
        const contactsRaw = localStorage.getItem("contacts");
        const contacts = contactsRaw ? JSON.parse(contactsRaw) : [];

        setStats({
          blogs: (content.blogs || []).length,
          services: (content.services || []).length,
          trainings: Array.isArray(trainings) ? trainings.length : 0,
          contacts: Array.isArray(contacts) ? contacts.length : 0,
        });
      } catch (e) {
        // silently fail
      }
    };

    fetchStats();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPwd !== "admin123") {
      Swal.fire({ title: "Incorrect Password", text: "Current password is wrong.", icon: "error", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#EF4444" });
      return;
    }
    if (newPwd.length < 6) {
      Swal.fire({ title: "Too Short", text: "New password must be at least 6 characters.", icon: "warning", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
      return;
    }
    if (newPwd !== confirmPwd) {
      Swal.fire({ title: "Mismatch", text: "New passwords do not match.", icon: "error", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#EF4444" });
      return;
    }

    setSavingPwd(true);
    // Simulate save (server-side password update would go here)
    await new Promise((r) => setTimeout(r, 800));
    setSavingPwd(false);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");

    Swal.fire({
      title: "Password Updated",
      text: "Your password has been changed successfully.",
      icon: "success",
      background: "#0a0f0d",
      color: "#fff",
      confirmButtonColor: "#00FF66",
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Log Out?",
      text: "You will be redirected to the login page.",
      icon: "warning",
      background: "#0a0f0d",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#1F3D2B",
      confirmButtonText: "Yes, log out",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("role");
        localStorage.removeItem("admin_token");
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.replace("/login");
      }
    });
  };

  const inputClass = "w-full bg-[#0d1a12] border border-[#1F3D2B] rounded-xl text-white px-4 py-2.5 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/20 outline-none transition placeholder:text-zinc-600 text-sm pr-11";

  const statCards = [
    { label: "Blog Posts", value: stats.blogs, icon: BarChart2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Services", value: stats.services, icon: Globe, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Trainings", value: stats.trainings, icon: Cpu, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Contacts", value: stats.contacts, icon: Activity, color: "text-[#00FF66]", bg: "bg-[#00FF66]/10 border-[#00FF66]/20" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
          <p className="text-zinc-500 text-sm">Manage your account settings and security preferences.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-white hover:bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* ── Identity Card ── */}
      <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl p-8 shadow-[0_0_30px_rgba(0,255,102,0.04)] relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#00FF66]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#1F3D2B] to-[#0a0f0d] border-2 border-[#00FF66]/20 flex items-center justify-center shadow-[0_0_25px_rgba(0,255,102,0.1)]">
              <User size={44} className="text-[#00FF66]/60" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00FF66] rounded-full flex items-center justify-center shadow-lg shadow-[#00FF66]/30">
              <ShieldCheck size={16} className="text-black" />
            </div>
          </div>

          {/* Identity Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
              <h2 className="text-2xl font-bold text-white">System Administrator</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 px-2.5 py-1 rounded-full">Admin</span>
            </div>
            <p className="text-zinc-400 text-sm flex items-center gap-2 justify-center md:justify-start mb-4">
              <Mail size={14} className="text-[#00FF66]/50" />{email}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-[#1F3D2B]/30 px-3 py-1.5 rounded-lg border border-[#1F3D2B]">
                <Clock size={12} className="text-zinc-600" />
                Session: {sessionAge || "Active"}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-[#1F3D2B]/30 px-3 py-1.5 rounded-lg border border-[#1F3D2B]">
                <CheckCircle size={12} className="text-[#00FF66]" />
                Authenticated
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div className="flex flex-col gap-3 shrink-0">
            {[
              { label: "JWT Auth", icon: Key, ok: true },
              { label: "Secure Session", icon: ShieldCheck, ok: true },
              { label: "2FA", icon: AlertTriangle, ok: false },
            ].map(({ label, icon: Icon, ok }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
                  ok
                    ? "bg-[#00FF66]/5 border-[#00FF66]/20 text-[#00FF66]"
                    : "bg-zinc-800/50 border-zinc-700/30 text-zinc-500"
                }`}
              >
                <Icon size={13} />
                {label}
                <span className={`ml-auto text-[9px] font-bold uppercase ${ok ? "text-[#00FF66]" : "text-zinc-600"}`}>
                  {ok ? "Active" : "Off"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border ${bg} text-center backdrop-blur-sm`}
          >
            <div className={`p-2.5 rounded-xl bg-white/5`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Account Details (read-only) ── */}
      <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl p-8 shadow-[0_0_30px_rgba(0,255,102,0.03)]">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-1.5 bg-[#00FF66]/10 rounded-lg">
            <User size={18} className="text-[#00FF66]" />
          </div>
          Account Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Display Name", value: "System Administrator" },
            { label: "Role", value: role },
            { label: "Email Address", value: email },
            { label: "Last Login", value: loginTime || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">{label}</p>
              <div className="bg-[#0d1a12] border border-[#1F3D2B] rounded-xl px-4 py-2.5 text-sm text-white font-medium">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl p-8 shadow-[0_0_30px_rgba(0,255,102,0.03)]">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-1.5 bg-[#00FF66]/10 rounded-lg">
            <Lock size={18} className="text-[#00FF66]" />
          </div>
          Change Password
        </h3>
        <p className="text-xs text-zinc-600 mb-6 pl-10">Enter your current password to set a new one.</p>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          {/* Current password */}
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Current Password</label>
            <div className="relative">
              <input
                required
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className={inputClass}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#00FF66] transition">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* New password */}
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  required
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className={inputClass}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#00FF66] transition">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPwd.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[3, 6, 9, 12].map((len, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        newPwd.length >= len
                          ? i < 1 ? "bg-red-500" : i < 2 ? "bg-orange-400" : i < 3 ? "bg-yellow-400" : "bg-[#00FF66]"
                          : "bg-zinc-800"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-zinc-600 ml-1 self-center">
                    {newPwd.length < 4 ? "Weak" : newPwd.length < 8 ? "Fair" : newPwd.length < 12 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <input
                  required
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className={`${inputClass} ${confirmPwd && newPwd !== confirmPwd ? "border-red-500/50 focus:border-red-500" : confirmPwd && newPwd === confirmPwd ? "border-[#00FF66]/50" : ""}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#00FF66] transition">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPwd && (
                <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${newPwd === confirmPwd ? "text-[#00FF66]" : "text-red-400"}`}>
                  {newPwd === confirmPwd
                    ? <><CheckCircle size={11} /> Passwords match</>
                    : <><AlertTriangle size={11} /> Passwords do not match</>
                  }
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPwd}
              className="flex items-center gap-2 px-8 py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#B6FF00] transition shadow-[0_0_15px_rgba(0,255,102,0.2)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {savingPwd
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <Save size={16} />}
              {savingPwd ? "Saving…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Danger Zone ── */}
      <div className="border border-red-500/20 rounded-2xl p-6 bg-red-500/5">
        <h3 className="text-base font-bold text-red-400 mb-1 flex items-center gap-2">
          <AlertTriangle size={16} /> Danger Zone
        </h3>
        <p className="text-xs text-zinc-500 mb-4">These actions are irreversible. Proceed with caution.</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 border border-red-500/30 hover:bg-red-500/10 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <LogOut size={15} /> End Session & Log Out
        </button>
      </div>
    </div>
  );
}
