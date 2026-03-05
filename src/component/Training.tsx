"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

/* ---------------- DEFAULT TRAINING DATA ---------------- */
export const defaultTrainingPrograms = [
  {
    id: "security-awareness",
    title: "Security Awareness Training",
    subtitle: "Human Firewall Training",
    role: "All Employees",
    level: "Beginner",
    duration: "2–4 Hours",
    description:
      "Build a strong human firewall by training employees to recognize cyber threats.",
    features: [
      "Phishing Identification",
      "Password & MFA Best Practices",
      "Social Engineering Defense",
      "Safe Remote Work Practices",
    ],
  },
  {
    id: "cloud-security",
    title: "Cloud Security Training",
    subtitle: "Protect Cloud Environments",
    role: "Cloud Engineers",
    level: "Intermediate",
    duration: "3–5 Hours",
    description:
      "Learn best practices for securing cloud environments.",
    features: [
      "AWS Security",
      "Azure Security",
      "GCP Security",
      "IAM Policies",
    ],
  },
];

/* ---------------- COMPONENT ---------------- */
export default function Training() {
  const router = useRouter();

  // ✅ Redux Admin Check (Final Version)
  const isAdmin = useSelector(
    (state: RootState) => state.auth.role === "admin"
  );

  const [trainings, setTrainings] = useState(defaultTrainingPrograms);
  const [selectedRole, setSelectedRole] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [newTraining, setNewTraining] = useState<any>({
    title: "",
    subtitle: "",
    role: "",
    level: "",
    duration: "",
    description: "",
    features: "",
  });

  const roles = [
    "All",
    "All Employees",
    "Developers",
    "SOC Team",
    "Cloud Engineers",
    "Management",
  ];

  const filteredTrainings =
    selectedRole === "All"
      ? trainings
      : trainings.filter((t) => t.role === selectedRole);

  const handleAddTraining = () => {
    if (!newTraining.title || !newTraining.description) return;

    const newItem = {
      id: crypto.randomUUID(),
      title: newTraining.title,
      subtitle: newTraining.subtitle,
      role: newTraining.role,
      level: newTraining.level,
      duration: newTraining.duration,
      description: newTraining.description,
      features: newTraining.features
        .split(",")
        .map((f: string) => f.trim())
        .filter(Boolean),
    };

    setTrainings([...trainings, newItem]);
    setShowForm(false);
    setNewTraining({
      title: "",
      subtitle: "",
      role: "",
      level: "",
      duration: "",
      description: "",
      features: "",
    });
  };

  const handleDelete = (id: string) =>
    setTrainings(trainings.filter((t) => t.id !== id));

  const handleExplore = (id: string) =>
    router.push(`/training/${id}`);

  return (
    <section className="py-24 bg-black border-t border-[#1F3D2B] min-h-screen">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="flex justify-center items-center gap-3 text-4xl font-bold
            bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
            <GraduationCap className="text-[#00FF66]" />
            Enterprise Security Training
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Role-based cybersecurity training programs for enterprise environments.
          </p>
        </div>

        {/* ROLE FILTER */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-5 py-2 rounded-full border text-sm transition
                ${
                  selectedRole === role
                    ? "bg-[#00FF66] text-black border-[#00FF66]"
                    : "border-[#1F3D2B] text-gray-300 hover:border-[#00FF66]"
                }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* ADMIN ADD BUTTON */}
        {isAdmin && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
                text-black font-semibold rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Add Training Program
            </button>
          </div>
        )}

        {/* GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrainings.map((training, i) => (
            <motion.div
              key={training.id}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ delay: i * 0.05 }}
              className="relative cursor-pointer rounded-2xl p-8 bg-zinc-900/60
                border border-[#1F3D2B] hover:border-[#00FF66]
                hover:shadow-[0_0_40px_rgba(0,255,102,0.25)] transition-all"
            >
              {/* DELETE BUTTON */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(training.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}

              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {training.title}
                </h3>
                <ShieldCheck className="text-[#00FF66]" />
              </div>

              {training.subtitle && (
                <p className="text-gray-400 text-sm mb-2">
                  {training.subtitle}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#00FF66]/20 text-[#00FF66]">
                  {training.role}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                  {training.level}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                  {training.duration}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                {training.description}
              </p>

              <div className="space-y-2 mb-4">
                {training.features.map((f, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-300 flex items-center"
                  >
                    <span className="h-1.5 w-1.5 bg-[#00FF66] rounded-full mr-2" />
                    {f}
                  </div>
                ))}
              </div>

              <div
                onClick={() => handleExplore(training.id)}
                className="mt-6 flex items-center text-sm text-[#00FF66] cursor-pointer hover:underline"
              >
                Explore Program <ChevronRight className="ml-1" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ADD MODAL */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md border border-[#1F3D2B] space-y-3">
                <h3 className="text-lg font-semibold mb-2">
                  Add Training Program
                </h3>

                {[
                  "title",
                  "subtitle",
                  "role",
                  "level",
                  "duration",
                  "description",
                  "features",
                ].map((key) => (
                  <input
                    key={key}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={newTraining[key]}
                    onChange={(e) =>
                      setNewTraining({
                        ...newTraining,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-black border border-[#1F3D2B] rounded"
                  />
                ))}

                <button
                  onClick={handleAddTraining}
                  className="w-full py-2 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black font-semibold rounded"
                >
                  Save Training
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}