"use client";

import { motion } from "framer-motion";
import { GraduationCap, ChevronRight, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Training() {

  const router = useRouter();
  const [trainings, setTrainings] = useState<any[]>([]);

  // ---------------- FETCH TRAININGS ----------------
  const fetchTrainings = async () => {
    try {
      const res = await axios.get("/api/trainings");
      setTrainings(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);


  const handleExplore = (id: string) => {
    router.push(`/training/${id}`);
  };

  // ---------------- RENDER ----------------
  return (
    <section className="py-24 bg-black min-h-screen">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">

            Enterprise Security Training
          </h2>
        </div>



        {/* TRAINING GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {trainings.map((training) => (

            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
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
              className="bg-black border border-zinc-700 shadow-lg p-4 rounded-xl relative hover:border-[#00FF66] transition-all duration-300 cursor-pointer"
              style={{ perspective: 1000 }}
            >


              {/* IMAGE */}
              <motion.div 
                className="bg-zinc-800 aspect-[22/13] rounded-xl overflow-hidden cursor-pointer"
                onClick={() => handleExplore(training.id)}
                whileHover={{ boxShadow: "0 0 20px rgba(0, 255, 102, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src={training.image ? (training.image.startsWith("/") ? training.image : `/${training.image}`) : "/services/cyber_security_abstract_1_1773654503262.png"}
                  alt={training.title}
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
                  onClick={() => handleExplore(training.id)}
                  whileHover={{ color: "#00FF66", x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  {training.title}
                </motion.h3>

                {/* SUBTITLE */}
                <motion.p 
                  className="text-zinc-400 text-sm font-medium mb-4 line-clamp-3 cursor-pointer transition-colors"
                  whileHover={{ color: "#d4d4d8" }}
                  transition={{ duration: 0.2 }}
                >
                  {training.subtitle || "Enterprise security training program."}
                </motion.p>

                {/* BUTTON */}
                <motion.button
                  onClick={() => handleExplore(training.id)}
                  className="inline-block px-4 py-1.5 tracking-wider bg-[#00FF66] hover:bg-[#00cc52] rounded-full text-black text-[13px] font-bold w-fit transition-colors"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Explore Program
                </motion.button>
              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}