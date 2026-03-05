"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setRole } from "@/store/authSlice";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        // store role + token
        localStorage.setItem("role", data.role);
        localStorage.setItem("admin_token", data.token);
        dispatch(setRole({ role: data.role, token: data.token }));

        router.replace("/"); // go to dashboard
      }
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-zinc-900 p-8 rounded-xl border border-[#1F3D2B] w-full max-w-md">
        <h2 className="text-white text-2xl mb-6 text-center font-bold">Admin Login</h2>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 bg-black border border-[#1F3D2B] text-white rounded"
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 bg-black border border-[#1F3D2B] text-white rounded"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}