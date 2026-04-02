"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setRole } from "@/store/authSlice";
import { Eye, EyeOff } from "lucide-react"; // 👈 import icons

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 new state

  const router = useRouter();
  const dispatch = useDispatch();

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        localStorage.setItem("role", data.role);
        localStorage.setItem("admin_token", data.token);
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400;`;
        dispatch(setRole({ role: data.role, token: data.token }));
        router.replace("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="grid md:grid-cols-2 items-center gap-4 max-w-6xl w-full p-4 border border-[#1F3D2B] rounded-xl shadow-[0_0_40px_rgba(0,255,102,0.1)]">

        {/* LEFT SIDE FORM */}
        <div className="w-full px-4 py-6">
          <div className="mb-10">
            <h1 className="text-white text-3xl font-bold">Admin Login</h1>
            <p className="text-sm mt-4 text-zinc-400">
              Secure access to dashboard
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          {/* EMAIL */}
          <div>
            <label className="text-zinc-300 text-xs font-medium block mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-white bg-transparent border-b border-zinc-600 focus:border-[#00FF66] px-2 py-3 outline-none transition"
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-8 relative">
            <label className="text-zinc-300 text-xs font-medium block mb-2">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"} // 👈 toggle
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-white bg-transparent border-b border-zinc-600 focus:border-[#00FF66] px-2 py-3 outline-none transition pr-10"
            />

            {/* 👁 Eye Icon */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-[38px] cursor-pointer text-zinc-400 hover:text-[#00FF66]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* REMEMBER + FORGOT */}
          <div className="flex justify-between items-center mt-6 text-sm">
            <label className="flex items-center gap-2 text-zinc-400">
              <input type="checkbox" className="accent-[#00FF66]" />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-[#00FF66] hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full mt-10 py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-[#B6FF00] to-[#00FF66] hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="hidden md:flex w-full h-full items-center justify-center bg-[#001a0f] rounded-xl p-8">
          <img
            src="/services/cyber_security_abstract_1_1773654503262.png"
            alt="login"
            className="w-full object-contain"
          />
        </div>

      </div>
    </div>
  );
}