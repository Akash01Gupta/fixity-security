"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { Toaster } from "react-hot-toast";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide Navbar and Footer on admin routes
  const isAdminRoute = pathname?.startsWith("/dashboard") || pathname === "/login";

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <main className={!isAdminRoute ? "pt-20 min-h-screen relative" : "min-h-screen relative"}>
        {children}

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#000",
              color: "#00FF66",
              border: "1px solid #1F3D2B",
              minWidth: "300px",
              textAlign: "center",
            },
          }}
        />
      </main>

      {!isAdminRoute && <Footer />}
    </>
  );
}
