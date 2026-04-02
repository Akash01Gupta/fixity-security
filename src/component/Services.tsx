"use client"
import { useEffect, useRef, useState } from "react"
import { Shield, Lock, Key, Server, Eye, AlertOctagon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { useRouter } from "next/navigation"


/* ─── Service Card Component (Advanced UI) ────────────────────────── */
function ServiceCard({
  service,
  index,
  isOpen,
  onToggle,
  onClickSub
}: any) {

  const router = useRouter()

  const cardImages = [
    "/services/cyber_security_abstract_1_1773654503262.png",
    "/services/cyber_security_abstract_2_1773654922828.png",
    "/services/cyber_security_abstract_3_1773654950668.png",
  ]

  const imageSrc = service.image
    ? (service.image.startsWith("/") ? service.image : `/${service.image}`)
    : cardImages[index % cardImages.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{
        y: -8,
        scale: 1.03,
        boxShadow: "0 0 25px rgba(0, 255, 102, 0.25), 0 15px 35px rgba(0, 0, 0, 0.4)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.97 }}
      className="bg-black border border-zinc-700 shadow-lg p-4 rounded-xl relative group hover:border-[#00FF66] transition-all duration-300 cursor-pointer"
      style={{ perspective: 1000 }}
    >
      {/* IMAGE */}
      <motion.div
        className="bg-zinc-800 aspect-[22/13] rounded-xl overflow-hidden cursor-pointer"
        onClick={() => router.push(`/services/${service.id}`)}
        whileHover={{ boxShadow: "0 0 20px rgba(0, 255, 102, 0.2)" }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={imageSrc}
          alt={service.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>

      {/* CONTENT */}
      <div className="px-2 mt-6">
        {/* TITLE */}
        <motion.h3
          className="text-base font-semibold text-white mb-3 line-clamp-2 cursor-pointer transition-colors"
          onClick={() => router.push(`/services/${service.id}`)}
          whileHover={{ color: "#00FF66", x: 2 }}
          transition={{ duration: 0.2 }}
        >
          {service.title}
        </motion.h3>

        {/* SUBTITLE */}
        <motion.p
          className="text-zinc-400 text-sm font-medium mb-4 line-clamp-3 cursor-pointer transition-colors"
          whileHover={{ color: "#d4d4d8" }}
          transition={{ duration: 0.2 }}
        >
          {service.subtitle || "Comprehensive security services"}
        </motion.p>


      </div>

      {/* SUB SERVICES (Dropdown) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 border-t border-zinc-700 pt-3"
          >
            <div className="space-y-2">
              {service.subServices?.map((sub: any, subIdx: number) => (
                <motion.div
                  key={sub.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClickSub(service.id, sub.id)
                  }}
                  className="flex items-center justify-between text-sm text-zinc-400 cursor-pointer px-2 py-1 rounded transition-all"
                  whileHover={{ backgroundColor: "rgb(39 39 42)", x: 4, color: "#00FF66" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: subIdx * 0.05 } }}
                >
                  <motion.span
                    className="truncate"
                    whileHover={{ fontWeight: 600 }}
                  >
                    {sub.title}
                  </motion.span>

                </motion.div>
              ))}
              {(!service.subServices || service.subServices.length === 0) && (
                <motion.p
                  className="text-xs text-zinc-500 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  No solutions configured.
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
/* ─── Main Services Component ───────────────────────────────────────── */
export default function Services() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [openService, setOpenService] = useState<string | null>(null)

  const icons = [Shield, Lock, Key, Server, Eye, AlertOctagon]

  const fetchServices = async () => {
    try {
      const res = await axios.get("/api/content")
      const data = res.data
      const updatedServices = (data.services || []).map((s: any, idx: number) => ({
        ...s,
        id: s.id || `svc-${idx}`,
        features: Array.isArray(s.features) ? s.features : (s.features ? s.features.split(",") : []),
        subServices: (s.subServices || []).map((sub: any, sIdx: number) => ({
          ...sub,
          id: sub.id || `sub-${idx}-${sIdx}`,
          features: Array.isArray(sub.features) ? sub.features : (sub.features ? sub.features.split(",") : []),
          benefits: Array.isArray(sub.benefits) ? sub.benefits : (sub.benefits ? sub.benefits.split(",") : []),
          details: sub.details || sub.desc || "",
        })),
      }))
      setServices(updatedServices)
    } catch (err) {
      console.error("Failed to fetch services", err)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleSubServiceClick = (serviceId: string, subId: string) => {
    router.push(`/services/${serviceId}/${subId}`)
  }


  return (
    <section className="py-24 bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="relative flex items-center justify-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* CENTER TITLE */}
          <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
            Our Services
          </h2>

        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
        >
          {services.length === 0 && (
            <p className="text-gray-400 col-span-full text-center">No services available</p>
          )}

          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              Icon={icons[i % icons.length]}
              isOpen={openService === service.id}
              onToggle={setOpenService}
              onClickSub={handleSubServiceClick}
            />
          ))}
        </motion.div>
      </div>

    </section>
  )
}