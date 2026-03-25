"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

/* ---------------- Section Component ---------------- */
const Section: React.FC<any> = ({ section }) => {
  if (!section) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-[#0B1220] border border-[#1F3D2B] rounded-xl p-6 space-y-4 hover:border-[#00FF66]/50 transition-colors"
    >
      {section.title && (
        <h3 className="text-2xl font-semibold text-white">{section.title}</h3>
      )}
      {section.subtitle && (
        <p className="text-[#94a3b8] text-lg">{section.subtitle}</p>
      )}
      {section.description && (
        <p className="text-[#cbd5f5] text-base">{section.description}</p>
      )}
      {section.points?.length > 0 && (
        <ul className="space-y-2 pl-5">
          {section.points.map((point: string, i: number) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-2 text-[#cbd5f5] items-start"
            >
              <span className="w-3 h-3 bg-[#00FF66] rounded-full mt-1"></span>
              <span>{point}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

/* ---------------- Feature / Benefit Component ---------------- */
const FeatureBenefit: React.FC<{ title: string; items?: string[]; className?: string }> = ({
  title,
  items,
  className = "",
}) => {
  if (!items?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`bg-zinc-900 border border-[#1F3D2B] rounded-xl p-6 space-y-4 shadow-lg shadow-[#00FF66]/5 ${className}`}
    >
      <h3 className="text-[#00FF66] font-semibold text-xl">{title}</h3>
      <ul className="space-y-2 pl-1">
        {items.map((item: string, idx: number) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-2 text-[#cbd5f5] items-start"
          >
            <span className="w-3 h-3 bg-[#00FF66] rounded-full mt-1 flex-shrink-0"></span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

/* ---------------- Page Component ---------------- */
export default function TrainingSubPage() {
  const { trainingId } = useParams();
  const router = useRouter();

  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const res = await axios.get("/api/trainings");
        const found = res.data.find((t: any) => t.id === trainingId);
        setTraining(found);
      } catch (err) {
        console.error("Error fetching training:", err);
        setTraining(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTraining();
  }, [trainingId]);

  if (loading) return <p className="text-white p-10">Loading...</p>;

  if (!training) {
    return (
      <div className="p-10 text-white">
        <h1 className="text-2xl font-bold mb-4">Training not found</h1>
        <button
          onClick={() => router.push("/training")}
          className="px-6 py-3 bg-[#00FF66] text-black rounded hover:bg-[#00e65c] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <section className="bg-[#020617] min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6 text-white">
        {/* Back Button */}
        <button
          onClick={() => router.push("/training")}
          className="flex items-center gap-2 text-[#00FF66] mb-10 hover:opacity-80"
        >
          <ChevronLeft size={18} />
          Back to Training
        </button>

        <div className="space-y-10">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <h1 className="text-4xl font-bold">{training.title}</h1>
            <p className="text-xl mb-4 text-[#00FF66]">{training.subtitle}</p>
          </motion.div>

          {/* ---------------- Top Row: Features + Benefits | Image ---------------- */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Features + Benefits (50%) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="flex flex-col gap-6 w-full lg:w-1/2"
            >
              <FeatureBenefit title="Features" items={training.features} />
              <FeatureBenefit title="Benefits" items={training.benefits} />
            </motion.div>

            {/* Right Column: Image (50%) */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="w-full lg:w-1/2 min-h-[320px] lg:min-h-[400px] relative rounded-xl overflow-hidden shadow-2xl shadow-[#00FF66]/10 border border-[#1F3D2B]"
            >
              <motion.img
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                src={
                  training.image 
                    ? (training.image.startsWith("http") || training.image.startsWith("blob") || training.image.startsWith("/")) 
                      ? training.image 
                      : `/${training.image}`
                    : "/services/cyber_security_abstract_1_1773654503262.png"
                }
                className="absolute inset-0 w-full h-full object-cover bg-[#0B1220]"
                alt={training.title}
              />
            </motion.div>
          </div>

          {/* ---------------- Bottom Row: Details + Sections | Image ---------------- */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Details + Sections (50%) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6 w-full lg:w-1/2 mt-4 p-8 rounded-2xl border border-[#1F3D2B] bg-[#0B1220]"
            >
              {/* Details */}
              {training.details && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-white">Details</h3>
                  <p className="text-[#cbd5f5] text-lg leading-relaxed">
                    {training.details}
                  </p>
                </div>
              )}

              {/* Sections */}
              {training.sections?.length > 0 && (
                <div className="space-y-4">
                  {training.sections.map((section: any, idx: number) => (
                    <Section key={idx} section={section} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Column: Image (50%) */}
            {/* {training.image && (
              <div className="w-full lg:w-1/2 h-80 lg:h-auto">
                <img
                  src={training.image}
                  className="w-full h-full object-cover rounded-xl"
                  alt={training.title}
                />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </section>
  );
}