"use client";

import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import { useRef } from "react";
import { ShieldCheck, Target, Eye } from "lucide-react";

export default function AboutUsPage() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const stats = [
    { label: "Years of Experience", value: 6 },
    { label: "Global Clients", value: 50 },
    { label: "Security Projects Delivered", value: 120 },
    { label: "Certified Experts", value: 10 },
  ];

  return (
    <section className="bg-black text-white">

      {/* ================= HERO ================= */}
      <div className="py-32 border-b border-[#1F3D2B]  text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >

          <span className="bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
            About{" "}
            Fixity Security
          </span>

        </motion.h1>
        <span className="block max-w-6xl mx-auto mt-5 text-gray-000 text-lg">
          Leading the Way in Cybersecurity Excellence</span>
        <p className="max-w-3xl mx-auto text-gray-400 text-lg">
          Protecting businesses is not just our service — it’s our responsibility.
        </p>
      </div>

      {/* ================= OUR STORY =================
      <div className="py-24 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-8"
        >
          Our Story
        </motion.h2>

        <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
          <p>
            Fixity Security was founded with a simple belief — businesses deserve
            peace of mind in a world filled with digital threats. What started
            as a small team of security enthusiasts has grown into a trusted
            cybersecurity partner for organizations worldwide.
          </p>

          <p>
            We’ve seen firsthand how cyberattacks can disrupt operations,
            damage reputations, and cost millions. That’s why we built Fixity
            Security around proactive defense, continuous monitoring, and
            strategic security planning.
          </p>

          <p>
            Today, we work closely with our clients — not just as service
            providers, but as long-term security partners dedicated to
            safeguarding their digital future.
          </p>
        </div>
      </div> */}

      {/* ================= MISSION & VISION CARDS ================= */}
      <div className="py-24 bg-zinc-900/40 border-y border-[#1F3D2B] px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

          {/* Mission Card */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-2xl p-8 bg-black border border-[#1F3D2B]
              hover:border-[#00FF66]
              hover:shadow-[0_0_40px_rgba(0,255,102,0.3)] transition-all"
          >
            <div className="mb-5 h-14 w-14 flex items-center justify-center rounded-xl bg-[#00FF66]/10">
              <Target className="h-7 w-7 text-[#00FF66]" />
            </div>

            <h3 className="text-xl font-semibold mb-3 text-[#00FF66]">
              Our Mission
            </h3>

            <p className="text-gray-400">
              To deliver reliable, scalable, and future-ready cybersecurity
              solutions that empower organizations to operate securely and
              confidently in the digital era.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-2xl p-8 bg-black border border-[#1F3D2B]
              hover:border-[#00FF66]
              hover:shadow-[0_0_40px_rgba(0,255,102,0.3)] transition-all"
          >
            <div className="mb-5 h-14 w-14 flex items-center justify-center rounded-xl bg-[#B6FF00]/10">
              <Eye className="h-7 w-7 text-[#00FF66]"/>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-[#00FF66]">
              Our Vision
            </h3>

            <p className="text-gray-400">
              To become a globally recognized cybersecurity leader by
              continuously innovating and staying ahead of emerging
              digital threats.
            </p>
          </motion.div>

          {/* Core Values Card */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-2xl p-8 bg-black border border-[#1F3D2B]
              hover:border-[#00FF66]
              hover:shadow-[0_0_40px_rgba(0,255,102,0.3)] transition-all"
          >
            <div className="mb-5 h-14 w-14 flex items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck className="h-7 w-7 text-[#00FF66]" />
            </div>

            <h3 className="text-xl font-semibold mb-3 text-[#00FF66]">
              Our Core Values
            </h3>

            <p className="text-gray-400">
              Integrity, transparency, innovation, and commitment to excellence
              define how we protect and serve our clients.
            </p>
          </motion.div>

        </div>


        {/* ================= STATS ================= */}
        <div ref={statsRef} className="py-28 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <div
                  className="text-4xl font-bold
                bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
                bg-clip-text text-transparent"
                >
                  {statsInView ? (
                    <CountUp end={value} duration={2} suffix="+" />
                  ) : (
                    "0+"
                  )}
                </div>
                <p className="mt-2 text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}