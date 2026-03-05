"use client";

import { useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import WhyChooseUs from "./WhyChooseUs";

export default function Hero() {
  const router = useRouter();

  /* ---------- STATS VIEW ---------- */
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInView(statsRef, {
    once: true,
    margin: "-120px",
  });

  /* ---------- STATS DATA ---------- */
  const stats = useMemo(
    () => [
      { label: "Years Experience", value: 6 },
      { label: "Certified Clients", value: 50 },
      { label: "Industry Certifications", value: 15 },
      { label: "Security Experts", value: 10 },
    ],
    []
  );

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-black text-white py-52 border-b border-[#1F3D2B] overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/hero-background.png')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/70" aria-hidden />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-8">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 text-4xl sm:text-6xl font-bold leading-tight"
          >
            Securing Your <br />
            <span className="bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
              Digital Future
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="max-w-xl text-lg text-gray-400"
          >
            Enterprise-grade cybersecurity solutions to defend your
            infrastructure against modern threats.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              onClick={() => router.push("/services")}
              className="px-8 py-3 rounded-lg font-bold text-black
              bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
              hover:opacity-90 transition
              shadow-[0_0_30px_rgba(0,255,102,0.35)]"
            >
              Get Started
            </button>

            <button
              onClick={() => router.push("/aboutus")}
              className="px-8 py-3 rounded-lg font-bold
              border border-[#00FF66] text-[#B6FF00]
              hover:bg-[#00FF66]/10 transition"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section
        className="relative bg-black text-white py-40 border-b border-[#1F3D2B] overflow-hidden"
      >
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2
          w-[420px] h-[420px]
          bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
          rounded-full opacity-20 blur-3xl"
          aria-hidden
        />

        <div className="relative max-w-5xl mx-auto px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
              About Fixi Security
            </span>
          </motion.h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Fixi Security helps organizations stay ahead of cyber threats
            through proactive defense, continuous monitoring, and
            expert-driven security strategies.
          </p>

          <div className="mt-10">
            <button
              onClick={() => router.push("/aboutus")}
              className="px-7 py-3 rounded-lg font-semibold
              bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
              text-black shadow-[0_0_25px_rgba(0,255,102,0.35)]"
            >
              Learn More About Us
            </button>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className="text-4xl font-bold
                  bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
                  bg-clip-text text-transparent"
                >
                  {statsInView ? (
                    <CountUp end={value} duration={2} suffix="+" />
                  ) : (
                    "0+"
                  )}
                </motion.div>
                <p className="mt-2 text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
    </>
  );
}