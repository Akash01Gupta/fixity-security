"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/component/admin/Sidebar";
import AdminHeader from "@/component/admin/AdminHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-[#00FF66] selection:text-black">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
