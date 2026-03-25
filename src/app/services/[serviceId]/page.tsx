"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { ArrowLeft, Shield } from "lucide-react"

export default function ServiceLandingPage() {
  const { serviceId } = useParams()
  const router = useRouter()
  const [service, setService] = useState<any>(null)

  useEffect(() => {
    async function loadService() {
      try {
        const res = await axios.get("/api/content")
        const services = res.data.services || []
        const found = services.find((s: any) => s.id === serviceId)
        setService(found)
      } catch (err) {
        console.error("Error loading service:", err)
      }
    }
    loadService()
  }, [serviceId])

  if (!service) return <div className="text-white p-20 text-center font-medium bg-black min-h-screen flex items-center justify-center">Loading Services...</div>

  return (
    <section className="bg-black min-h-screen text-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="text-[#00FF66] mb-8 hover:underline flex items-center gap-2 group transition-all"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Services</span>
        </motion.button>

        {/* Header */}
        <motion.div
          className="mb-14 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Blobs */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#00FF66]/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#B6FF00]/5 blur-[120px] rounded-full pointer-events-none" />

          <h1 className="text-xl md:text-xl font-extrabold text-white mb-6 tracking-tight">
            {service.title}
          </h1>
          <p className="text-zinc-200 text-lg max-w-lg leading-relaxed font-medium">
            {service.subtitle}
          </p>
        </motion.div>

        {/* Sub Services Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
        >
          {service.subServices?.map((sub: any, idx: number) => (
            <motion.div
              key={sub.id}
              variants={{
                hidden: { opacity: 0, y: 30, rotateX: -10 },
                visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 260, damping: 15, delay: idx * 0.05 } }
              }}
              whileHover={{ 
                y: -12, 
                scale: 1.04,
                boxShadow: "0 0 30px rgba(0, 255, 102, 0.3), 0 20px 40px rgba(0, 0, 0, 0.5)",
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              whileTap={{ scale: 0.96 }}
              className="bg-black block max-w-sm p-6 border border-zinc-700 rounded-lg shadow-lg h-96 flex flex-col hover:border-[#00FF66] transition-all duration-300 cursor-pointer"
              style={{ perspective: 1000 }}
            >
              <motion.a 
                href="#" 
                onClick={(e) => { e.preventDefault(); router.push(`/services/${serviceId}/${sub.id}`) }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-full h-48 overflow-hidden rounded-lg mb-4 bg-zinc-800"
                  whileHover={{ boxShadow: "0 0 20px rgba(0, 255, 102, 0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.img
                    src={sub.image || "/placeholder.jpg"}
                    alt={sub.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              </motion.a>
              <motion.a 
                href="#" 
                onClick={(e) => { e.preventDefault(); router.push(`/services/${serviceId}/${sub.id}`) }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.h5 
                  className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-white transition-colors duration-300 cursor-pointer"
                  whileHover={{ color: "#00FF66" }}
                  transition={{ duration: 0.2 }}
                >
                  {sub.title}
                </motion.h5>
              </motion.a>
              <motion.p 
                className="mb-6 text-zinc-400 transition-colors duration-300 cursor-pointer"
                whileHover={{ color: "#d4d4d8" }}
                transition={{ duration: 0.2 }}
              >
                {sub.subtitle || sub.desc}
              </motion.p>
              {/* <a
                href="#"
                onClick={(e) => { e.preventDefault(); router.push(`/services/${serviceId}/${sub.id}`) }}
                className="inline-flex items-center text-gray-600 bg-gray-200 box-border border border-gray-300 hover:bg-gray-300 hover:text-gray-900 focus:ring-4 focus:ring-gray-300 shadow-sm font-medium leading-5 rounded-lg text-sm px-4 py-2.5 focus:outline-none mt-auto hover:scale-105 transition-all duration-300"
              >
                Read more
                <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
                </svg>
              </a> */}
            </motion.div>
          ))}
        </motion.div>

        {(!service.subServices || service.subServices.length === 0) && (
          <div className="text-center py-20 bg-zinc-950 rounded-3xl border border-zinc-900">
            <p className="text-zinc-500 italic">No sub-services listed for this category yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}