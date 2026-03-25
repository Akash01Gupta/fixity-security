"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Shield, Lock, Key, Server, Eye, AlertOctagon, X, Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import Swal from "sweetalert2"

/* ─── Add Service Modal ─────────────────────────────────────────────── */
function AddServiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<"service" | "subservice">("service")

  // --- Service form state ---
  const [svcTitle, setSvcTitle] = useState("")
  const [svcSubtitle, setSvcSubtitle] = useState("")
  const [svcFeatures, setSvcFeatures] = useState("")
  const [svcBenefits, setSvcBenefits] = useState("")
  const [svcLoading, setSvcLoading] = useState(false)

  const [newSubServices, setNewSubServices] = useState({
    title: "",
    subtitle: "",
    details: "",
    features: "",
    benefits: "",
    sections: [{ title: "", points: [] as string[] }]
  })

  // --- Sub-service form state ---
  const [services, setServices] = useState<any[]>([])
  const [selectedSvcId, setSelectedSvcId] = useState("")
  const [subTitle, setSubTitle] = useState("")
  const [subSubtitle, setSubSubtitle] = useState("")
  const [subDesc, setSubDesc] = useState("")
  const [subFeatures, setSubFeatures] = useState("")
  const [subBenefits, setSubBenefits] = useState("")
  const [subImage, setSubImage] = useState<File | null>(null)
  const [subLoading, setSubLoading] = useState(false)
  const [svcImage, setSvcImage] = useState<File | null>(null)

  useEffect(() => {
    axios.get("/api/content").then(r => setServices(r.data.services || []))
  }, [])

  const token = () =>
    localStorage.getItem("admin_token") || localStorage.getItem("token") || ""

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setSvcLoading(true)

    try {
      const formData = new FormData()
      formData.append("id", crypto.randomUUID())
      formData.append("title", svcTitle.trim())
      formData.append("subtitle", svcSubtitle.trim())
      formData.append("features", svcFeatures)
      formData.append("benefits", svcBenefits)

      if (svcImage) {
        formData.append("image", svcImage)
      }

      const res = await axios.post("/api/content", formData, {
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "multipart/form-data"
        }
      })

      if (res.data?.success) {
        onCreated()
      } else {
        alert(res.data?.error || "Error")
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed")
    } finally {
      setSvcLoading(false)
    }
  }

  const handleAddSubService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSvcId) return alert("Please select a parent service.")
    setSubLoading(true)
    try {
      const formData = new FormData()
      formData.append("serviceId", selectedSvcId)
      formData.append("subService[title]", subTitle.trim())
      formData.append("subService[subtitle]", subSubtitle.trim())
      formData.append("subService[desc]", subDesc.trim())
      formData.append("subService[features]", subFeatures)
      formData.append("subService[benefits]", subBenefits)
      formData.append("subService[details]", newSubServices.details)
      formData.append("subService[sections]", JSON.stringify(newSubServices.sections))
      if (subImage) formData.append("subService[image]", subImage)

      const res = await axios.put("/api/content", formData, {
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" }
      })
      if (res.data?.success) {
        onCreated()
      } else {
        alert(`Server error: ${res.data?.error || "Unknown error"}`)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Failed to add sub-service."
      alert(`Error: ${msg}`)
      console.error("Add sub-service error:", err)
    } finally {
      setSubLoading(false)
    }
  }

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#00FF66] transition"
  const labelCls = "block text-xs font-medium text-zinc-400 mb-1"

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">Add New Entry</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {(["service", "subservice"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition ${tab === t ? "text-[#00FF66] border-b-2 border-[#00FF66]" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {t === "service" ? "Service" : "Sub-Service"}
              </button>
            ))}
          </div>

          <div className="px-6 py-6">
            {tab === "service" ? (
              <form key="service-form" onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input required className={inputCls} placeholder="e.g. Network Security" value={svcTitle} onChange={e => setSvcTitle(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Subtitle</label>
                  <input className={inputCls} placeholder="Short description" value={svcSubtitle || ""} onChange={e => setSvcSubtitle(e.target.value)} />
                </div>

                <div>
                  <label className={labelCls}>Image</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
                    onChange={e => setSubImage(e.target.files?.[0] || null)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={svcLoading}
                  className="w-full bg-[#00FF66] text-black font-bold py-2.5 rounded-xl hover:bg-[#00cc52] transition disabled:opacity-60"
                >
                  {svcLoading ? "Adding..." : "Add Service"}
                </button>
              </form>
            ) : (
              <form key="subservice-form" onSubmit={handleAddSubService} className="space-y-4">
                <div>
                  <label className={labelCls}>Parent Service *</label>
                  <select required className={inputCls + " cursor-pointer"} value={selectedSvcId || ""} onChange={e => setSelectedSvcId(e.target.value)}>
                    <option value="">— Select Service —</option>
                    {services.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Title *</label>
                  <input required className={inputCls} placeholder="Sub-service title" value={subTitle} onChange={e => setSubTitle(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Subtitle</label>
                  <input className={inputCls} placeholder="Short subtitle" value={subSubtitle} onChange={e => setSubSubtitle(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Features <span className="text-zinc-600">(comma-separated)</span></label>
                  <input className={inputCls} placeholder="Feature A, Feature B" value={subFeatures || ""} onChange={e => setSubFeatures(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Benefits <span className="text-zinc-600">(comma-separated)</span></label>
                  <input className={inputCls} placeholder="Benefit A, Benefit B" value={subBenefits || ""} onChange={e => setSubBenefits(e.target.value)} />
                </div>
                {/* DETAILS */}
                <div>
                  <label className={labelCls}>Details</label>
                  <textarea
                    className={inputCls}
                    placeholder="Sub-service Details"
                    rows={3}
                    value={newSubServices.details}
                    onChange={(e) => setNewSubServices({ ...newSubServices, details: e.target.value })}
                  />
                </div>

                {/* SECTION TITLE */}
                <div>
                  <label className={labelCls}>Section Title</label>
                  <input
                    placeholder="Section Title"
                    className={inputCls}
                    value={newSubServices.sections[0].title}
                    onChange={(e) => {
                      const sections = [...newSubServices.sections]
                      sections[0].title = e.target.value
                      setNewSubServices({ ...newSubServices, sections })
                    }}
                  />
                </div>

                {/* SECTION POINTS */}
                <div>
                  <label className={labelCls}>Section Points <span className="text-zinc-600">(comma-separated)</span></label>
                  <input
                    placeholder="Point A, Point B"
                    className={inputCls}
                    value={newSubServices.sections[0].points.join(", ")}
                    onChange={(e) => {
                      const sections = [...newSubServices.sections]
                      sections[0].points = e.target.value.split(",").map(p => p.trim())
                      setNewSubServices({ ...newSubServices, sections })
                    }}
                  />
                </div>


                <div>
                  <label className={labelCls}>Image</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
                    onChange={e => setSubImage(e.target.files?.[0] || null)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="w-full bg-[#00FF66] text-black font-bold py-2.5 rounded-xl hover:bg-[#00cc52] transition disabled:opacity-60"
                >
                  {subLoading ? "Adding..." : "Add Sub-Service"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


/* ─── Service Card Component (Advanced UI) ────────────────────────── */
function ServiceCard({
  service,
  index,
  isAdmin,
  isOpen,
  onToggle,
  onDelete,
  onSubDelete,
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
      {/* ADMIN DELETE */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(service.id)
          }}
          className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg z-30"
          title="Delete Service"
        >
          <X size={16} />
        </button>
      )}

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

                  {isAdmin && (
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Trash2
                        size={14}
                        className="text-red-500 hover:text-red-400 ml-2 shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSubDelete(service.id, sub.id)
                        }}
                      />
                    </motion.div>
                  )}
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
  const role = useSelector((state: RootState) => state.auth.role)
  const isAdmin = role === "admin"

  const [services, setServices] = useState<any[]>([])
  const [openService, setOpenService] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

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

  const deleteService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const { value: userInput } = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete this service, please type "${service.title}":`,
      input: "text",
      inputPlaceholder: service.title,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete Service",
      background: "#18181b",
      color: "#fff",
      inputValidator: (value) => {
        if (!value) return "Title is required!";
        if (value !== service.title) return "Title mismatch!";
      }
    });

    if (userInput) {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token")
        await axios.delete(`/api/content?serviceId=${serviceId}&title=${encodeURIComponent(userInput)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setServices(prev => prev.filter(s => s.id !== serviceId))
        Swal.fire({
          title: "Deleted!",
          text: "Service has been removed.",
          icon: "success",
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#00FF66"
        });
      } catch (err: any) {
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.error || "Failed to delete service.",
          icon: "error",
          background: "#18181b",
          color: "#fff"
        });
      }
    }
  }

  const deleteSubService = async (serviceId: string, subId: string) => {
    const service = services.find(s => s.id === serviceId);
    const sub = service?.subServices?.find((s: any) => s.id === subId);
    if (!sub) return;

    const { value: userInput } = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete this sub-service, please type "${sub.title}":`,
      input: "text",
      inputPlaceholder: sub.title,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete Sub-service",
      background: "#18181b",
      color: "#fff",
      inputValidator: (value) => {
        if (!value) return "Title is required!";
        if (value !== sub.title) return "Title mismatch!";
      }
    });

    if (userInput) {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token")
        await axios.delete(`/api/content?serviceId=${serviceId}&subId=${subId}&title=${encodeURIComponent(userInput)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setServices(prev =>
          prev.map(s =>
            s.id === serviceId
              ? { ...s, subServices: s.subServices.filter((sub: any) => sub.id !== subId) }
              : s
          )
        )
        Swal.fire({
          title: "Deleted!",
          text: "Sub-service has been removed.",
          icon: "success",
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#00FF66"
        });
      } catch (err: any) {
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.error || "Failed to delete sub-service.",
          icon: "error",
          background: "#18181b",
          color: "#fff"
        });
      }
    }
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

          {/* RIGHT SIDE BUTTON */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00FF66] text-black px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold hover:bg-[#00cc52] transition shadow-[0_0_15px_rgba(0,255,102,0.4)] flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Service</span>
            </motion.button>
          )}
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
              isAdmin={isAdmin}
              isOpen={openService === service.id}
              onToggle={setOpenService}
              onDelete={deleteService}
              onSubDelete={deleteSubService}
              onClickSub={handleSubServiceClick}
            />
          ))}
        </motion.div>
      </div>

      {showModal && (
        <AddServiceModal
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false)
            await fetchServices()
          }}
        />
      )}
    </section>
  )
}