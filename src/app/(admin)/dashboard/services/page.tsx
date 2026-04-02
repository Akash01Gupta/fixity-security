"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Layers, X, GripVertical, Edit3, FileText, ListChecks, Sparkles, ImageIcon } from "lucide-react";
import Swal from "sweetalert2";

interface SectionItem {
  title: string;
  points: string[];
}

interface SubFormData {
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  benefits: string[];
  details: string;
  sections: SectionItem[];
}

const emptySubForm: SubFormData = {
  title: "",
  subtitle: "",
  desc: "",
  features: [],
  benefits: [],
  details: "",
  sections: [],
};

export default function ServicesManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", subtitle: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Sub-service State
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [subFormData, setSubFormData] = useState<SubFormData>({ ...emptySubForm });
  const [subImageFile, setSubImageFile] = useState<File | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Chip input states
  const [featureInput, setFeatureInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  // Active form tab
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "sections">("basic");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      console.error("Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("subtitle", formData.subtitle);
    if (imageFile) fd.append("image", imageFile);

    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ title: "", subtitle: "" });
        setImageFile(null);
        fetchServices();
        Swal.fire({ title: "Success", text: "Service created!", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
      } else {
        const err = await res.json();
        Swal.fire({ title: "Error", text: err.error || "Failed", icon: "error", background: "#0a0f0d", color: "#fff" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: "Something went wrong", icon: "error", background: "#0a0f0d", color: "#fff" });
    }
  };

  const handleDelete = async (id: string, currentTitle: string) => {
    const { value: titleInput } = await Swal.fire({
      title: "Are you sure?",
      text: `Type "${currentTitle}" to confirm deletion.`,
      input: "text",
      icon: "warning",
      background: "#0a0f0d",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#1F3D2B",
      confirmButtonText: "Yes, delete it!",
      inputValidator: (value) => {
        if (value !== currentTitle) return "Title does not match!";
      }
    });

    if (titleInput === currentTitle) {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
        const res = await fetch(`/api/content?serviceId=${id}&title=${encodeURIComponent(currentTitle)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          Swal.fire({ title: "Deleted!", text: "Service deleted.", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
          fetchServices();
        } else {
          Swal.fire({ title: "Error", text: "Failed to delete", icon: "error", background: "#0a0f0d", color: "#fff" });
        }
      } catch (e) {
        Swal.fire({ title: "Error", text: "Something went wrong", icon: "error", background: "#0a0f0d", color: "#fff" });
      }
    }
  };

  /* ---- Sub-Service CRUD ---- */

  const openSubModal = (serviceId: string, existingSub?: any) => {
    setSelectedServiceId(serviceId);
    if (existingSub) {
      setEditingSubId(existingSub.id);
      setSubFormData({
        title: existingSub.title || "",
        subtitle: existingSub.subtitle || "",
        desc: existingSub.desc || "",
        features: existingSub.features || [],
        benefits: existingSub.benefits || [],
        details: typeof existingSub.details === "string" ? existingSub.details : "",
        sections: existingSub.sections || [],
      });
    } else {
      setEditingSubId(null);
      setSubFormData({ ...emptySubForm });
    }
    setSubImageFile(null);
    setFeatureInput("");
    setBenefitInput("");
    setActiveTab("basic");
    setShowSubModal(true);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setSelectedServiceId(null);
    setEditingSubId(null);
    setSubFormData({ ...emptySubForm });
    setSubImageFile(null);
    setFeatureInput("");
    setBenefitInput("");
  };

  const handleCreateSubService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;
    setSubmitting(true);

    const fd = new FormData();
    fd.append("serviceId", selectedServiceId);
    if (editingSubId) fd.append("subServiceId", editingSubId);
    fd.append("subService[title]", subFormData.title);
    fd.append("subService[subtitle]", subFormData.subtitle);
    fd.append("subService[desc]", subFormData.desc);
    fd.append("subService[features]", subFormData.features.join(","));
    fd.append("subService[benefits]", subFormData.benefits.join(","));
    fd.append("subService[details]", subFormData.details);
    fd.append("subService[sections]", JSON.stringify(subFormData.sections));
    if (subImageFile) fd.append("subService[image]", subImageFile);

    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        closeSubModal();
        fetchServices();
        Swal.fire({
          title: "Success",
          text: editingSubId ? "Sub-Service updated!" : "Sub-Service created!",
          icon: "success",
          background: "#0a0f0d",
          color: "#fff",
          confirmButtonColor: "#00FF66",
        });
      } else {
        const err = await res.json();
        Swal.fire({ title: "Error", text: err.error || "Failed", icon: "error", background: "#0a0f0d", color: "#fff" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: "Something went wrong", icon: "error", background: "#0a0f0d", color: "#fff" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSub = async (serviceId: string, subId: string, subTitle: string) => {
    const { value: titleInput } = await Swal.fire({
      title: "Delete Sub-Service?",
      text: `Type "${subTitle}" to confirm deletion.`,
      input: "text",
      icon: "warning",
      background: "#0a0f0d",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#1F3D2B",
      confirmButtonText: "Delete",
      inputValidator: (v) => v !== subTitle ? "Title mismatch!" : ""
    });

    if (titleInput === subTitle) {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
        const res = await fetch(`/api/content?serviceId=${serviceId}&subId=${subId}&title=${encodeURIComponent(subTitle)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          Swal.fire({ title: "Deleted!", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
          fetchServices();
        } else {
          Swal.fire({ title: "Error", text: "Failed to delete sub-service", icon: "error", background: "#0a0f0d", color: "#fff" });
        }
      } catch (err) {
        Swal.fire({ title: "Error", text: "Server error", icon: "error", background: "#0a0f0d", color: "#fff" });
      }
    }
  };

  /* ---- Chip helpers ---- */
  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !subFormData.features.includes(val)) {
      setSubFormData({ ...subFormData, features: [...subFormData.features, val] });
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    setSubFormData({ ...subFormData, features: subFormData.features.filter((_, i) => i !== idx) });
  };

  const addBenefit = () => {
    const val = benefitInput.trim();
    if (val && !subFormData.benefits.includes(val)) {
      setSubFormData({ ...subFormData, benefits: [...subFormData.benefits, val] });
      setBenefitInput("");
    }
  };

  const removeBenefit = (idx: number) => {
    setSubFormData({ ...subFormData, benefits: subFormData.benefits.filter((_, i) => i !== idx) });
  };

  /* ---- Section helpers ---- */
  const addSection = () => {
    setSubFormData({
      ...subFormData,
      sections: [...subFormData.sections, { title: "", points: [""] }],
    });
  };

  const removeSection = (idx: number) => {
    setSubFormData({
      ...subFormData,
      sections: subFormData.sections.filter((_, i) => i !== idx),
    });
  };

  const updateSectionTitle = (idx: number, title: string) => {
    const s = [...subFormData.sections];
    s[idx] = { ...s[idx], title };
    setSubFormData({ ...subFormData, sections: s });
  };

  const addSectionPoint = (sIdx: number) => {
    const s = [...subFormData.sections];
    s[sIdx] = { ...s[sIdx], points: [...s[sIdx].points, ""] };
    setSubFormData({ ...subFormData, sections: s });
  };

  const removeSectionPoint = (sIdx: number, pIdx: number) => {
    const s = [...subFormData.sections];
    s[sIdx] = { ...s[sIdx], points: s[sIdx].points.filter((_, i) => i !== pIdx) };
    setSubFormData({ ...subFormData, sections: s });
  };

  const updateSectionPoint = (sIdx: number, pIdx: number, value: string) => {
    const s = [...subFormData.sections];
    const pts = [...s[sIdx].points];
    pts[pIdx] = value;
    s[sIdx] = { ...s[sIdx], points: pts };
    setSubFormData({ ...subFormData, sections: s });
  };

  /* ---- Input style constant ---- */
  const inputClass = "w-full bg-[#0d1a12] border border-[#1F3D2B] rounded-xl text-white px-4 py-2.5 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/20 outline-none transition placeholder:text-zinc-600 text-sm";

  const tabBtn = (tab: "basic" | "content" | "sections", label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        activeTab === tab
          ? "bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 shadow-[0_0_12px_rgba(0,255,102,0.1)]"
          : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-[#1F3D2B]"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
          <p className="text-zinc-400">Manage top-level services and sub-services.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#00FF66] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#B6FF00] transition shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          <Plus size={20} /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin"></div></div>
      ) : (
        <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,102,0.05)]">
          <table className="w-full text-left bg-transparent border-collapse border-b border-[#1F3D2B]">
            <thead>
              <tr className="border-b border-[#1F3D2B] bg-[#1F3D2B]/30 text-zinc-400 text-sm">
                <th className="p-4 indent-2 w-12"></th>
                <th className="p-4 w-20">Image</th>
                <th className="p-4">Title</th>
                <th className="p-4 text-center">Sub-Services</th>
                <th className="p-4 text-center text-red-500">Delete</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <React.Fragment key={svc.id}>
                  <tr className="border-b border-[#1F3D2B] hover:bg-[#1F3D2B]/40 transition text-zinc-300">
                    <td className="p-4 cursor-pointer text-[#00FF66]" onClick={() => setExpanded(expanded === svc.id ? null : svc.id)}>
                      {expanded === svc.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </td>
                    <td className="p-4">
                      {svc.image ? <img src={svc.image} alt="Svc" className="w-12 h-12 object-cover rounded-lg border border-[#1F3D2B]" /> : <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xs">No Img</div>}
                    </td>
                    <td className="p-4 font-bold text-white text-lg">{svc.title}</td>
                    <td className="p-4 text-center">
                      <span className="bg-[#1F3D2B] px-3 py-1 rounded-full text-xs font-semibold text-[#00FF66]">{svc.subServices?.length || 0}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <button onClick={() => handleDelete(svc.id, svc.title)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition" title="Delete Top-Level Service">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === svc.id && (
                    <tr className="bg-[#050706] border-b border-[#1F3D2B]">
                      <td colSpan={5} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-white font-semibold flex items-center gap-2">
                             <Layers size={16} className="text-[#00FF66]" /> 
                             Sub-Services for {svc.title}
                           </h4>
                           <button onClick={() => openSubModal(svc.id)} className="text-[#0a0f0d] bg-[#00FF66] hover:bg-[#B6FF00] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition">
                             <Plus size={14} /> Add Sub-Service
                           </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {svc.subServices?.map((sub: any) => (
                            <div key={sub.id} className="bg-[#1F3D2B]/20 p-4 rounded-xl border border-[#1F3D2B] relative group hover:border-[#00FF66]/30 transition-colors">
                              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => openSubModal(svc.id, sub)} className="text-[#00FF66] hover:text-white hover:bg-[#00FF66]/20 p-1.5 rounded-md transition-colors shadow-lg" title="Edit">
                                   <Edit3 size={14} />
                                 </button>
                                 <button onClick={() => handleDeleteSub(svc.id, sub.id, sub.title)} className="text-red-400 hover:text-white hover:bg-red-500 p-1.5 rounded-md transition-colors shadow-lg" title="Delete">
                                   <Trash2 size={14} />
                                 </button>
                              </div>
                              {sub.image && (
                                <div className="w-full h-24 rounded-lg overflow-hidden mb-3 border border-[#1F3D2B]/50">
                                  <img src={sub.image} alt={sub.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <h5 className="text-[#00FF66] font-bold text-lg truncate pr-16">{sub.title}</h5>
                              {sub.subtitle && <p className="text-xs text-zinc-300 mt-1 truncate">{sub.subtitle}</p>}
                              <div className="flex gap-3 mt-3 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                {sub.features?.length > 0 && <span>{sub.features.length} Features</span>}
                                {sub.benefits?.length > 0 && <span>{sub.benefits.length} Benefits</span>}
                                {sub.sections?.length > 0 && <span>{sub.sections.length} Sections</span>}
                              </div>
                            </div>
                          ))}
                          {(!svc.subServices || svc.subServices.length === 0) && (
                            <div className="col-span-full border border-dashed border-[#1F3D2B] rounded-xl p-8 text-center text-zinc-500 flex flex-col items-center">
                              <Layers size={32} className="mb-2 opacity-20" />
                              <p>No sub-services fully created yet.</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500 font-medium">No services found. Start by creating one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Main Service Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl w-full max-w-lg p-6 shadow-[0_0_40px_rgba(0,255,102,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-6">Add Top-Level Service</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block font-medium">Service Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block font-medium">Subtitle</label>
                <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block font-medium">Service Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-white file:bg-[#1F3D2B] file:text-[#00FF66] file:rounded-md file:border-0 file:px-4 file:py-2 cursor-pointer file:hover:bg-[#1F3D2B]/80 file:transition text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-zinc-400 hover:text-white bg-[#1F3D2B]/20 rounded-xl transition font-medium py-3">Cancel</button>
                 <button type="submit" className="flex-1 py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#B6FF00] shadow-[0_0_15px_rgba(0,255,102,0.2)]">Create Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ═══  ENHANCED SUB-SERVICE MODAL  ═══════════════════ */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showSubModal && (
        <div className="fixed inset-0 z-[60] flex justify-center items-start bg-black/85 backdrop-blur-md p-4 pt-8 overflow-y-auto">
          <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl w-full max-w-3xl shadow-[0_0_60px_rgba(0,255,102,0.08)] mb-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F3D2B]">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-[#00FF66]/10 rounded-lg">
                    <Layers size={20} className="text-[#00FF66]" />
                  </div>
                  {editingSubId ? "Edit Sub-Service" : "Add Sub-Service"}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">Fill in all the details for this sub-service module.</p>
              </div>
              <button onClick={closeSubModal} className="text-zinc-500 hover:text-white p-2 hover:bg-[#1F3D2B] rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-4 border-b border-[#1F3D2B]/50 bg-[#050706]">
              {tabBtn("basic", "Basic Info", <FileText size={15} />)}
              {tabBtn("content", "Content & Media", <Sparkles size={15} />)}
              {tabBtn("sections", "Sections", <ListChecks size={15} />)}
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubService}>
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">

                {/* ──── TAB: BASIC INFO ──── */}
                {activeTab === "basic" && (
                  <div className="space-y-5 animate-in fade-in">
                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Title <span className="text-red-400">*</span></label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Web Application Security Assessment"
                          value={subFormData.title}
                          onChange={(e) => setSubFormData({ ...subFormData, title: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Subtitle</label>
                        <input
                          type="text"
                          placeholder="e.g. Identify and mitigate vulnerabilities"
                          value={subFormData.subtitle}
                          onChange={(e) => setSubFormData({ ...subFormData, subtitle: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Features (Chips) */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Features</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {subFormData.features.map((f, i) => (
                          <span key={i} className="flex items-center gap-1.5 bg-[#00FF66]/10 text-[#00FF66] px-3 py-1 rounded-full text-xs font-semibold border border-[#00FF66]/20">
                            {f}
                            <button type="button" onClick={() => removeFeature(i)} className="hover:text-white transition"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a feature and press Add"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); }}}
                          className={inputClass}
                        />
                        <button type="button" onClick={addFeature} className="px-4 py-2 bg-[#1F3D2B] text-[#00FF66] rounded-xl text-xs font-bold hover:bg-[#1F3D2B]/80 transition whitespace-nowrap">
                          <Plus size={14} className="inline mr-1" />Add
                        </button>
                      </div>
                    </div>

                    {/* Benefits (Chips) */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Benefits</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {subFormData.benefits.map((b, i) => (
                          <span key={i} className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/20">
                            {b}
                            <button type="button" onClick={() => removeBenefit(i)} className="hover:text-white transition"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a benefit and press Add"
                          value={benefitInput}
                          onChange={(e) => setBenefitInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); }}}
                          className={inputClass}
                        />
                        <button type="button" onClick={addBenefit} className="px-4 py-2 bg-[#1F3D2B] text-green-400 rounded-xl text-xs font-bold hover:bg-[#1F3D2B]/80 transition whitespace-nowrap">
                          <Plus size={14} className="inline mr-1" />Add
                        </button>
                      </div>
                    </div>

                    {/* Image */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">
                        <ImageIcon size={12} className="inline mr-1" />
                        Header Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSubImageFile(e.target.files?.[0] || null)}
                        className="w-full text-white file:bg-[#1F3D2B] file:text-[#00FF66] file:rounded-lg file:border-0 file:px-4 file:py-2 cursor-pointer file:hover:bg-[#1F3D2B]/80 file:transition text-sm bg-[#0d1a12] border border-[#1F3D2B] rounded-xl p-1"
                      />
                      {editingSubId && !subImageFile && (
                        <p className="text-xs text-zinc-600 mt-1">Leave empty to keep the existing image.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ──── TAB: CONTENT & MEDIA ──── */}
                {activeTab === "content" && (
                  <div className="space-y-5 animate-in fade-in">
                    {/* Description */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Description <span className="text-red-400">*</span></label>
                      <p className="text-[11px] text-zinc-600 mb-2">Main description text shown on the sub-service detail page. Supports paragraphs separated by blank lines.</p>
                      <textarea
                        required
                        rows={6}
                        placeholder="Describe the sub-service in detail. Include methodology, approach, and what the client can expect..."
                        value={subFormData.desc}
                        onChange={(e) => setSubFormData({ ...subFormData, desc: e.target.value })}
                        className={`${inputClass} resize-none leading-relaxed`}
                      />
                      <p className="text-[10px] text-zinc-600 mt-1 text-right">{subFormData.desc.length} characters</p>
                    </div>

                    {/* Details (alternate/supplementary) */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Additional Details <span className="text-zinc-600">(optional)</span></label>
                      <p className="text-[11px] text-zinc-600 mb-2">Supplementary details text. If provided, this is shown as the primary &quot;Details&quot; block; otherwise the description is used.</p>
                      <textarea
                        rows={4}
                        placeholder="Any additional context, technical details, or supplementary information..."
                        value={subFormData.details}
                        onChange={(e) => setSubFormData({ ...subFormData, details: e.target.value })}
                        className={`${inputClass} resize-none leading-relaxed`}
                      />
                    </div>
                  </div>
                )}

                {/* ──── TAB: SECTIONS ──── */}
                {activeTab === "sections" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">Content Sections</label>
                        <p className="text-[11px] text-zinc-600 mt-1">Add structured sections with title and bullet points (e.g. Methodology, Approach).</p>
                      </div>
                      <button
                        type="button"
                        onClick={addSection}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#00FF66]/10 text-[#00FF66] rounded-xl text-xs font-bold border border-[#00FF66]/20 hover:bg-[#00FF66]/20 transition"
                      >
                        <Plus size={14} /> Add Section
                      </button>
                    </div>

                    {subFormData.sections.length === 0 && (
                      <div className="border border-dashed border-[#1F3D2B] rounded-xl p-8 text-center text-zinc-600">
                        <ListChecks size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No sections added yet. Click &quot;Add Section&quot; to create one.</p>
                      </div>
                    )}

                    {subFormData.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="bg-[#0d1a12] border border-[#1F3D2B] rounded-xl p-4 space-y-3 relative group">
                        {/* Section Header */}
                        <div className="flex items-center gap-3">
                          <GripVertical size={16} className="text-zinc-600 shrink-0" />
                          <input
                            type="text"
                            placeholder={`Section title (e.g. Methodology)`}
                            value={sec.title}
                            onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                            className="flex-1 bg-transparent border-b border-[#1F3D2B] text-white font-semibold px-1 py-1.5 focus:border-[#00FF66] outline-none transition text-sm"
                          />
                          <button type="button" onClick={() => removeSection(sIdx)} className="text-red-400/60 hover:text-red-400 p-1 rounded transition" title="Remove section">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Section Points */}
                        <div className="pl-7 space-y-2">
                          {sec.points.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-[#00FF66]/40 rounded-full mt-3 shrink-0"></span>
                              <input
                                type="text"
                                placeholder="Bullet point text..."
                                value={pt}
                                onChange={(e) => updateSectionPoint(sIdx, pIdx, e.target.value)}
                                className="flex-1 bg-[#050706] border border-[#1F3D2B]/50 rounded-lg text-zinc-300 px-3 py-2 text-xs focus:border-[#00FF66]/50 outline-none transition"
                              />
                              <button
                                type="button"
                                onClick={() => removeSectionPoint(sIdx, pIdx)}
                                className="text-zinc-600 hover:text-red-400 p-1 transition mt-0.5"
                                title="Remove point"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addSectionPoint(sIdx)}
                            className="text-[#00FF66]/60 hover:text-[#00FF66] text-xs font-medium flex items-center gap-1 pl-3 pt-1 transition"
                          >
                            <Plus size={12} /> Add point
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 p-6 border-t border-[#1F3D2B] bg-[#050706] rounded-b-2xl">
                <div className="flex gap-1.5 text-[10px] text-zinc-600 font-medium">
                  <span className={`px-2 py-0.5 rounded-full ${subFormData.title ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Title</span>
                  <span className={`px-2 py-0.5 rounded-full ${subFormData.desc ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Desc</span>
                  <span className={`px-2 py-0.5 rounded-full ${subFormData.features.length > 0 ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Features</span>
                  <span className={`px-2 py-0.5 rounded-full ${subFormData.benefits.length > 0 ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Benefits</span>
                  <span className={`px-2 py-0.5 rounded-full ${subFormData.sections.length > 0 ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Sections</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeSubModal} className="text-zinc-400 hover:text-white bg-[#1F3D2B]/20 px-6 py-3 rounded-xl transition font-medium text-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#B6FF00] shadow-[0_0_15px_rgba(0,255,102,0.2)] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                    {editingSubId ? "Update Sub-Service" : "Publish Sub-Service"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
