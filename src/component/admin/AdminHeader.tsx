"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ShieldCheck, ChevronDown } from "lucide-react";
import { useDispatch } from "react-redux";
import { setRole } from "@/store/authSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHeader() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    dispatch(setRole({ role: null as any, token: null as any }));
    router.replace("/login");
  };

  return (
    <header className="h-16 bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-[#1F3D2B]/60 flex items-center justify-between px-8 sticky top-0 z-50 w-full text-zinc-300 shadow-sm shadow-[#0a0f0d]/50">
      <div></div>
      
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 hover:bg-white/5 py-1.5 px-3 rounded-full transition-all duration-300 group outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1F3D2B] to-[#0a0f0d] border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.1)] group-hover:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all">
            <User size={16} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold tracking-wide text-white group-hover:text-[#00FF66] transition-colors">Admin</span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-56 bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl shadow-2xl overflow-hidden py-2 z-50 origin-top-right"
            >
              <div className="px-4 py-3 border-b border-[#1F3D2B]/50 mb-1">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Signed in as</p>
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheck size={14} className="text-[#00FF66]" />
                  <p className="text-sm font-bold truncate">System Administrator</p>
                </div>
              </div>
              
              <div className="flex flex-col px-2">
                <button 
                  onClick={() => { setIsDropdownOpen(false); router.push("/dashboard/profile"); }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#1F3D2B]/50 hover:text-white text-zinc-300 rounded-xl transition-all w-full text-left"
                >
                  <User size={16} />
                  Profile Account
                </button>
                
                <div className="h-px bg-[#1F3D2B]/50 my-1 mx-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-all w-full text-left group"
                >
                  <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
