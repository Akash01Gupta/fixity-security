"use client";

import { motion } from "framer-motion";
import { CheckCircle, ShieldCheck, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface FeatureItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

interface RawFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface ContentResponse {
  whyChooseUs?: RawFeature[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  shield: ShieldCheck,
  users: Users,
  check: CheckCircle,
  clock: Clock,
};

/* ---------------- SKELETON ---------------- */
const FeatureSkeleton = ({ keyProp }: { keyProp: number }) => (
  <div
    key={keyProp}
    className="rounded-2xl p-8 bg-zinc-900/60 border border-[#1F3D2B] animate-pulse"
  >
    <div className="h-14 w-14 bg-zinc-700 rounded-xl mb-5" />
    <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3" />
    <div className="h-3 bg-zinc-700 rounded w-full" />
  </div>
);

const WhyChooseUs = () => {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- LOAD DATA ---------------- */
  const loadContent = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/content", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch content");
      const data: ContentResponse = await res.json();

      const mapped =
        data.whyChooseUs?.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: ICON_MAP[item.icon] ?? ShieldCheck,
        })) ?? [];

      setFeatures(mapped);
    } catch {
      setError("Failed to load features");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);



  return (
    <section id="why-choose-us" className="py-24 bg-black border-t border-[#1F3D2B]">
      <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl sm:text-4xl mb-4 font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">

          Why{" "}
          {/* <span className="bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent"> */}
            Choose Us
          {/* </span> */}
        </h2>

        {error && <p className="text-center text-red-400 mb-8">{error}</p>}

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Skeleton Loader */}
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <FeatureSkeleton keyProp={i} key={i} />)}

          {/* Features */}
          {!isLoading &&
            features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.id}
                  whileHover={{ y: -6, scale: 1.03 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-2xl p-8 bg-zinc-900/60 border border-[#1F3D2B]
                    hover:border-[#00FF66] hover:shadow-[0_0_40px_rgba(0,255,102,0.3)] transition-all"
                >


                  <div className="mb-5 h-14 w-14 flex items-center justify-center rounded-xl bg-[#00FF66]/10">
                    <Icon className="h-7 w-7 text-[#00FF66]" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400">{f.description}</p>
                </motion.div>
              );
            })}

          {/* Add Card (Removed) */}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
