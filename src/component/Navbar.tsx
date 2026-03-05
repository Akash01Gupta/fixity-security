"use client";

import { ShieldCheck, Home, Layers, GraduationCap, Phone, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavbarProps {
  isAdminPage?: boolean;
}

const Navbar = ({ isAdminPage = false }: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname(); 
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsAdmin(role === "admin");
  }, []);

  const logoutAdmin = () => {
    localStorage.removeItem("role");
    router.replace("/");
  };

  const linkStyle = (path: string) =>
    `flex items-center gap-2 text-sm font-medium transition ${
      pathname === path
        ? "text-[#00FF66]"
        : "text-gray-300 hover:text-[#00FF66]"
    }`;

  return (
    <header className="fixed top-0 w-full z-50 bg-black border-b border-[#1F3D2B]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="text-[#00FF66]" />
          <span className="text-lg font-bold bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
            FIXI SECURITY {isAdmin && "(ADMIN)"}
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/" className={linkStyle("/")}>
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link href="/services" className={linkStyle("/services")}>
            <Layers className="w-4 h-4" />
            Services
          </Link>

          <Link href="/training" className={linkStyle("/training")}>
            <GraduationCap className="w-4 h-4" />
            Training
          </Link>

          <Link href="/aboutus" className={linkStyle("/aboutus")}>
            <Phone className="w-4 h-4" />
            About Us
          </Link>

           <Link href="/contact" className={linkStyle("/contact")}>
            <Phone className="w-4 h-4" />
            Contact Us
          </Link>

          {isAdmin && (
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;