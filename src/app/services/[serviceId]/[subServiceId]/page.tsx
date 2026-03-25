"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ShieldCheck, Zap, Lock, Activity, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

/* ---------------- Section Component ---------------- */
const Section: React.FC<any> = ({ section }) => {
  if (!section) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0B1220] border border-[#1F3D2B] rounded-[2.5rem] p-8 space-y-6 hover:border-[#00FF66]/40 transition-all shadow-xl group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#00FF66]/5 rounded-xl border border-[#00FF66]/10 group-hover:bg-[#00FF66]/10 transition-colors">
          <Activity size={24} className="text-[#00FF66]" />
        </div>
        {section.title && <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{section.title}</h3>}
      </div>
      {section.description && <p className="text-xl text-[#cbd5f5] font-medium italic leading-relaxed opacity-80">{section.description}</p>}
      {section.points?.length > 0 && (
        <ul className="space-y-4">
          {section.points.map((p: string, i: number) => (
            <li key={i} className="flex gap-3 text-lg text-zinc-400 font-bold italic group-hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 bg-[#00FF66] mt-2.5 rounded-full shadow-[0_0_10px_#00FF66]"></span>
              {p}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default function SubServicePage() {
  const { serviceId, subServiceId } = useParams()
  const router = useRouter()
  const [subService, setSubService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSubService() {
      try {
        const res = await fetch("/api/content")
        const data = await res.json()

        const service = data.services.find((s: any) => s.id === serviceId)
        const found = service?.subServices?.find((s: any) => s.id === subServiceId)

        if (found) {
          setSubService({
            ...found,
            features: found.features || [],
            benefits: found.benefits || [],
            sections: found.sections || [],
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadSubService()
  }, [serviceId, subServiceId])

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-12 h-12 border-t-2 border-[#00FF66] rounded-full" />
    </div>
  )

  if (!subService) return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white font-black text-4xl italic uppercase">
      404_NOT_FOUND
    </div>
  )

  return (
    <section className="bg-black text-white py-10 min-h-screen selection:bg-[#00FF66] selection:text-black">
      <div className="max-w-7xl mx-auto px-6">

        {/* Back Navigator */}
        <motion.button
          whileHover={{ x: -10 }}
          onClick={() => router.back()}
          className="text-[#00FF66] mb-8 hover:underline flex items-center gap-2 group transition-all"
        >
          <ChevronLeft size={18} />
          Back to SubServices
        </motion.button>

        {/* Header Content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 space-y-8"
        >
          <h1 className="text-2xl font-bold">
            {subService.title} <br />
          </h1>
          <p className="text-xl mb-4 text-[#00FF66]">
            {subService.subtitle || "Establishing decentralized trust through rigorous cryptographic verification and audit protocols."}
          </p>
        </motion.div>

        {/* -------- TWO COLUMN LAYOUT: (FEATURES & BENEFITS) | IMAGE -------- */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-6">

          {/* ───────── LEFT: Features + Benefits (50%) ───────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 flex flex-col gap-6"
          >

            {/* FEATURES */}
            {subService.features?.length > 0 && (
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl space-y-5 group hover:border-[#00FF66]/50 transition-all relative overflow-hidden"
              >
                {/* Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

                <h3 className="text-[#00FF66] text-lg font-black  uppercase tracking-wider">
                  Features
                </h3>

                <ul className="space-y-3">
                  {subService.features.map((f: string, i: number) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-zinc-400 font-medium text-sm group-hover:text-white transition"
                    >
                      <CheckCircle2 size={14} className="text-[#00FF66] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* BENEFITS */}
            {subService.benefits?.length > 0 && (
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/10 shadow-2xl space-y-5 group hover:border-green-500/50 transition-all relative overflow-hidden"
              >
                {/* Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite]" />

                <h3 className="text-green-500 text-lg font-black  uppercase tracking-wider">
                  Benefits
                </h3>

                <ul className="space-y-3">
                  {subService.benefits.map((b: string, i: number) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-zinc-400 font-medium text-sm group-hover:text-white transition"
                    >
                      <Zap size={14} className="text-green-500 mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>

          {/* ───────── RIGHT: IMAGE (50%) ───────── */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden shadow-[0_25px_80px_-20px_rgba(0,255,102,0.25)] border border-[#1F3D2B] bg-[#0B1220] min-h-[280px] lg:min-h-[360px] group"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              src={
                subService.image
                  ? subService.image.startsWith("http") || subService.image.startsWith("/")
                    ? subService.image
                    : `/${subService.image}`
                  : "/services/cyber_security_abstract_1_1773654503262.png"
              }
              alt={subService.title}
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF66]/10 to-transparent pointer-events-none" />

            {/* Icon */}

          </motion.div>

        </div>

        {/* -------- ROW 2: DETAILS SECTION -------- */}
        {/* <div className="space-y-10 mb-2  rounded-2xl border"> */}

        {/* Details Content (Handling both 'desc' and 'details' fields) */}
        {(subService.details?.length > 0 || subService.desc) && (
          <div className="bg-zinc-900/20 backdrop-blur-md p-6 lg:p-12 rounded-2xl border border-white/5 space-y-4">

            <h3 className="text-xl font-black tracking-tight text-white">
              Details
            </h3>

            <p className="text-lg text-zinc-300 font-medium leading-relaxed opacity-80 whitespace-pre-wrap">
              {typeof subService.details === "string" && subService.details !== ""
                ? subService.details
                : subService.desc}
            </p>

          </div>
        )}

        {/* Dynamic Methodology Sections */}
        {subService.sections?.length > 0 && (
          <div className="rounded-2xl border grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subService.sections.map((sec: any, i: number) => (
              <Section key={i} section={sec} />
            ))}
          </div>
        )}
        {/* </div> */}


        {/* FINAL CTA */}
        {/* <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative mt-36 py-20 px-6 overflow-hidden rounded-[3rem] border border-[#00FF66]/20 bg-gradient-to-br from-[#6626d9] via-[#a91079] to-[#e91e63]"
        > */}

        {/* 🔥 Animated Glow Layer */}
        {/* <motion.div
            animate={{ x: [0, 50, -50, 0], y: [0, -40, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute w-96 h-96 bg-[#00FF66]/10 blur-3xl rounded-full top-[-80px] left-[-80px]"
          /> */}

        {/* <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10"> */}

        {/* ICON */}
        {/* <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-full"
            >
              <ShieldCheck size={24} className="text-white" />
            </motion.div> */}

        {/* TITLE */}
        {/* <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight"
            >
              Execute Security Audit
            </motion.h2> */}

        {/* DESCRIPTION */}
        {/* <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
            >
              Seal your architecture with world-class cryptographic verification.
              Experience the future of secure systems with our expert audit protocols.
            </motion.p> */}

        {/* 🚀 BUTTONS */}
        {/* <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8"> */}

        {/* PRIMARY BUTTON */}
        {/* <motion.button
                onClick={() => router.push('/contact')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(255,255,255,0.3)",
                    "0 0 25px rgba(255,255,255,0.6)",
                    "0 0 10px rgba(255,255,255,0.3)"
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-10 py-4 bg-white text-[#a91079] font-bold rounded-full text-lg uppercase transition-all"
              > */}
        {/* Secure Consultation */}
        {/* </motion.button> */}

        {/* SECONDARY BUTTON */}
        {/* <motion.a
                href="#"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 border border-white text-white rounded-full text-lg font-medium hover:bg-white hover:text-[#a91079] transition-all"
              >
                Get Started
              </motion.a>

            </div> */}
        {/* </div> */}

        {/* </motion.div> */}

      </div>
    </section >
  )
}