"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, Clock, CheckCircle, Plus, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

/* ---------------- DEFAULT SERVICES DATA ---------------- */
export const defaultServices = [
  {
    id: "cyber-security",
    title: "Cyber Security",
    subtitle: "Protect Your Assets",
    role: "All Employees",
    level: "Intermediate",
    duration: "2–4 Hours",
    description: "Learn how to secure your digital workspace and protect sensitive information.",
    features: ["Phishing Awareness", "Password Security", "Secure Remote Work"],
    subServices: [
      { id: "phishing", title: "Phishing Protection", desc: "Identify and report phishing attempts." },
      { id: "password", title: "Password Hygiene", desc: "Learn best practices for secure passwords." },
    ],
  },
  {
    id: "cloud-security",
    title: "Cloud Security",
    subtitle: "Protect Cloud Environments",
    role: "Cloud Engineers",
    level: "Advanced",
    duration: "3–5 Hours",
    description: "Learn best practices for securing cloud infrastructures.",
    features: ["IAM Policies", "Cloud Logging", "Incident Response"],
    subServices: [],
  },
];

/* ---------------- ICON MAP ---------------- */
const ICON_MAP: Record<string, React.ElementType> = {
  shield: ShieldCheck,
  users: Users,
  clock: Clock,
  check: CheckCircle,
};

interface SubService {
  id: string;
  title: string;
  desc: string;
}

interface ServiceItem {
  id: string;
  title: string;
  subtitle?: string;
  role?: string;
  level?: string;
  duration?: string;
  description: string;
  features: string[];
  subServices?: SubService[];
  icon?: string;
}

/* ---------------- COMPONENT ---------------- */
export default function Services() {
  const router = useRouter();
  const isAdmin = useSelector((state: RootState) => state.auth.role === "admin");

  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [selectedRole, setSelectedRole] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState<any>({
    title: "",
    subtitle: "",
    role: "",
    level: "",
    duration: "",
    description: "",
    features: "",
  });

  const roles = ["All", "All Employees", "Developers", "SOC Team", "Cloud Engineers", "Management"];

  const filteredServices =
    selectedRole === "All" ? services : services.filter((s) => s.role === selectedRole);

  const handleAddService = () => {
    if (!newService.title || !newService.description) return;

    const newItem: ServiceItem = {
      id: crypto.randomUUID(),
      title: newService.title,
      subtitle: newService.subtitle,
      role: newService.role,
      level: newService.level,
      duration: newService.duration,
      description: newService.description,
      features: newService.features.split(",").map((f: string) => f.trim()).filter(Boolean),
      subServices: [],
    };

    setServices([...services, newItem]);
    setShowForm(false);
    setNewService({
      title: "",
      subtitle: "",
      role: "",
      level: "",
      duration: "",
      description: "",
      features: "",
    });
  };

  const handleDelete = (id: string) => setServices(services.filter((s) => s.id !== id));

  const handleExplore = (id: string) => router.push(`/services/${id}`);

  return (
    <section className="py-24 bg-black border-t border-[#1F3D2B] min-h-screen">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="flex justify-center items-center gap-3 text-4xl font-bold
            bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
            <ShieldCheck className="text-[#00FF66]" />
            Our Services
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Enterprise service programs with detailed features and role-based options.
          </p>
        </div>

        {/* ROLE FILTER */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-5 py-2 rounded-full border text-sm transition
                ${selectedRole === role
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
              Add Service
            </button>
          </div>
        )}

        {/* GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service, i) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ delay: i * 0.05 }}
              className="relative cursor-pointer rounded-2xl p-8 bg-zinc-900/60
                border border-[#1F3D2B] hover:border-[#00FF66]
                hover:shadow-[0_0_40px_rgba(0,255,102,0.25)] transition-all"
            >
              {isAdmin && (
                <button
                  onClick={() => handleDelete(service.id)}
                  aria-label={`Delete ${service.title}`}
                  title="Delete Service"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}

              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <ShieldCheck className="text-[#00FF66]" />
              </div>

              {service.subtitle && (
                <p className="text-gray-400 text-sm mb-2">{service.subtitle}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                {service.role && <span className="px-3 py-1 rounded-full bg-[#00FF66]/20 text-[#00FF66]">{service.role}</span>}
                {service.level && <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">{service.level}</span>}
                {service.duration && <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">{service.duration}</span>}
              </div>

              <p className="text-sm text-gray-400 mb-4">{service.description}</p>

              <div className="space-y-2 mb-4">
                {service.features.map((f, idx) => (
                  <div key={idx} className="text-sm text-gray-300 flex items-center">
                    <span className="h-1.5 w-1.5 bg-[#00FF66] rounded-full mr-2" />
                    {f}
                  </div>
                ))}
              </div>

              {service.subServices?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {service.subServices.map((sub) => (
                    <div key={sub.id} className="bg-zinc-800 p-2 rounded flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[#00FF66] font-semibold">{sub.title}</p>
                        <p className="text-xs text-gray-400">{sub.desc}</p>
                      </div>
                      {isAdmin && (
                        <button className="text-red-500 hover:text-red-400">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => handleExplore(service.id)}
                className="mt-6 flex items-center text-sm text-[#00FF66] cursor-pointer hover:underline"
              >
                Explore Service <ChevronRight className="ml-1" />
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
                <h3 className="text-lg font-semibold mb-2">Add New Service</h3>
                
                {["title","subtitle","role","level","duration","description","features"].map((key) => (
                  <input
                    key={key}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={newService[key]}
                    onChange={(e) => setNewService({ ...newService, [key]: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-[#1F3D2B] rounded"
                  />
                ))}

                <button
                  onClick={handleAddService}
                  className="w-full py-2 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] text-black font-semibold rounded"
                >
                  Save Service
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}