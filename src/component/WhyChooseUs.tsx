"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ShieldCheck, Clock, Users, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

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
const FeatureSkeleton = () => (
  <div className="rounded-2xl p-8 bg-zinc-900/60 border border-[#1F3D2B] animate-pulse">
    <div className="h-14 w-14 bg-zinc-700 rounded-xl mb-5" />
    <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3" />
    <div className="h-3 bg-zinc-700 rounded w-full" />
  </div>
);

const WhyChooseUs = () => {
  const isAdmin = useSelector((state: RootState) => state.auth.role === "admin");

  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newCard, setNewCard] = useState({ title: "", description: "", icon: "shield" });

  /* ---------------- LOAD DATA ---------------- */
  const loadContent = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("admin_token"); // read token if admin
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

  /* ---------------- ADD FEATURE ---------------- */
  const addFeature = async () => {
    if (!newCard.title.trim() || !newCard.description.trim()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/content", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      const data: ContentResponse = await res.json();

      const featureWithId: RawFeature = {
        id: crypto.randomUUID(),
        title: newCard.title.trim(),
        description: newCard.description.trim(),
        icon: newCard.icon,
      };

      const updated = {
        ...data,
        whyChooseUs: [...(data.whyChooseUs ?? []), featureWithId],
      };

      const save = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!save.ok) throw new Error();

      setFeatures((prev) => [
        ...prev,
        {
          id: featureWithId.id,
          title: featureWithId.title,
          description: featureWithId.description,
          icon: ICON_MAP[featureWithId.icon] ?? ShieldCheck,
        },
      ]);

      setNewCard({ title: "", description: "", icon: "shield" });
      setShowForm(false);
    } catch (err) {
      alert("Failed to save feature: " + (err as any).message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE FEATURE ---------------- */
  const deleteFeature = async (id: string) => {
    if (!confirm("Delete this feature?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/content", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      const data: ContentResponse = await res.json();
      const updatedFeatures = data.whyChooseUs?.filter((f) => f.id !== id) ?? [];

      const save = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, whyChooseUs: updatedFeatures }),
      });
      if (!save.ok) throw new Error();

      setFeatures((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Failed to delete feature");
    }
  };

  return (
    <section id="why-choose-us" className="py-24 bg-black border-t border-[#1F3D2B]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-white mb-14">
          Why{" "}
          <span className="bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
            Choose Us
          </span>
        </h2>

        {error && <p className="text-center text-red-400 mb-8">{error}</p>}

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <FeatureSkeleton key={i} />)}

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
                  {isAdmin && (
                    <button
                      onClick={() => deleteFeature(f.id)}
                      aria-label={`Delete ${f.title}`}
                      title={`Delete ${f.title}`}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}

                  <div className="mb-5 h-14 w-14 flex items-center justify-center rounded-xl bg-[#00FF66]/10">
                    <Icon className="h-7 w-7 text-[#00FF66]" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400">{f.description}</p>
                </motion.div>
              );
            })}

          {isAdmin && !isLoading && (
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              onClick={() => setShowForm(true)}
              className="flex flex-col items-center justify-center rounded-2xl p-8
                bg-gradient-to-tr from-[#B6FF00]/20 to-[#00FF66]/20 border border-[#00FF66]/30 cursor-pointer font-bold text-[#00FF66]"
            >
              <Plus className="h-8 w-8 mb-2" />
              Add Card
            </motion.div>
          )}
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-black border border-[#1F3D2B] p-6 rounded-xl w-full max-w-md"
              >
                <h3 className="text-xl font-semibold mb-4">Add New Feature</h3>

                <input
                  placeholder="Title"
                  value={newCard.title}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  className="w-full mb-3 px-4 py-2 bg-black border border-[#1F3D2B] rounded"
                />

                <textarea
                  placeholder="Description"
                  rows={3}
                  value={newCard.description}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  className="w-full mb-3 px-4 py-2 bg-black border border-[#1F3D2B] rounded"
                />

                <div className="mb-4">
                  <label
                    htmlFor="icon-select"
                    className="block text-sm font-medium mb-1 text-gray-300"
                  >
                    Select Icon
                  </label>

                  <select
                    id="icon-select"
                    value={newCard.icon}
                    onChange={(e) => setNewCard({ ...newCard, icon: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-[#1F3D2B] rounded"
                  >
                    <option value="shield">Shield</option>
                    <option value="users">Users</option>
                    <option value="check">Check</option>
                    <option value="clock">Clock</option>
                  </select>
                </div>

                <button
                  disabled={saving}
                  onClick={addFeature}
                  className="w-full py-2 rounded bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black font-semibold disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default WhyChooseUs;