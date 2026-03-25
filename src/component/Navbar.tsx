"use client"

import Link from "next/link"
import axios from "axios"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, ChevronDown, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {

  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false)

  const [services, setServices] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)

  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null
    setIsAdmin(role === "admin")
    setIsMounted(true)

    async function fetchServices() {
      try {
        const res = await axios.get("/api/content")
        setServices(res.data.services || [])
      } catch {
        console.error("Failed to load services")
      }
    }

    fetchServices()
  }, [])

  const logoutAdmin = () => {
    localStorage.removeItem("role");
    router.replace("/");
  };

  return (

    <nav className="bg-black fixed w-full h-20 z-50 top-0 border-b border-[#1F3D2B]">

      <div className="relative flex items-center h-full justify-between max-w-7xl mx-auto px-8">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white tracking-wide">
          FIXI SECURITY {isMounted && isAdmin && "(ADMIN)"}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-white text-sl font-medium">

          <div>
            <Link href="/" className="hover:text-[#00FF66] transition">
              Home
            </Link>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >

            <button className="flex items-center gap-1 hover:text-[#00FF66] transition">

              Services

              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />

            </button>

          </div>

          <div>
            <Link href="/training" className="hover:text-[#00FF66]">
              Training
            </Link>
          </div>

          <div>
            <Link href="/blog" className="hover:text-[#00FF66]">
              Blog
            </Link>
          </div>

          <div>
            <Link href="/aboutus" className="hover:text-[#00FF66]">
              About
            </Link>
          </div>

          <div>
            <Link href="/contact" className="hover:text-[#00FF66]">
              Contact
            </Link>
          </div>

          {isMounted && isAdmin && (
            <button onClick={logoutAdmin} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}

        </div>

      </div>


      {/* MEGA MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-black border-t border-[#1F3D2B] shadow-lg"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <div className="max-w-screen-xl mx-auto px-8 py-10">

              <h3 className="text-white text-lg font-semibold mb-8 flex justify-center items-center">
                Our Services
              </h3>

              {/* 🔥 3 COLUMN LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

                {services.map((service) => (
                  <div key={service.id} className="break-inside-avoid">

                    <h4 className="text-[#00FF66] text-base font-semibold mb-4">
                      {service.title}
                    </h4>

                    <ul className="space-y-2">
                      {service.subServices?.map((sub: any) => (
                        <li key={sub.id}>
                          <Link
                            href={`/services/${service.id}/${sub.id}`}
                            onClick={() => setOpen(false)}
                            className="block text-gray-400 hover:text-[#fff] hover:underline transition duration-200 ease-in-out"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>

                  </div>
                ))}



              </div>

              {/* VIEW ALL CTA */}
              <div className="border-t border-[#1F3D2B]/50 mt-10 pt-6 text-center">
                <Link
                  href="/services"
                  onClick={() => setOpen(false)}
                  className="text-[#00FF66] mt-2 font-semibold hover:text-white hover:underline transition flex items-center justify-center gap-2"
                >
                  View All Services
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>

  )
}