"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X, GripVertical, FileText, Sparkles, ListChecks, ImageIcon, BookOpen, Clock, Wifi } from "lucide-react";
import Swal from "sweetalert2";

interface SectionItem {
  title: string;
  points: string[];
}

interface TrainingFormData {
  title: string;
  subtitle: string;
  description: string;
  type: string;
  duration: string;
  features: string[];
  benefits: string[];
  details: string;
  sections: SectionItem[];
}

const emptyForm: TrainingFormData = {
  title: "",
  subtitle: "",
  description: "",
  type: "Online",
  duration: "",
  features: [],
  benefits: [],
  details: "",
  sections: [],
};

export default function TrainingsManagement() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TrainingFormData>({ ...emptyForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Chip input states
  const [featureInput, setFeatureInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  // Active form tab
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "sections">("basic");

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trainings", { cache: "no-store" });
      const data = await res.json();
      setTrainings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const openModal = (existing?: any) => {
    if (existing) {
      setEditingId(existing.id);
      setFormData({
        title: existing.title || "",
        subtitle: existing.subtitle || "",
        description: existing.description || "",
        type: existing.type || "Online",
        duration: existing.duration || "",
        features: existing.features || [],
        benefits: existing.benefits || [],
        details: typeof existing.details === "string" ? existing.details : "",
        sections: existing.sections || [],
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm });
    }
    setImageFile(null);
    setFeatureInput("");
    setBenefitInput("");
    setActiveTab("basic");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setImageFile(null);
    setFeatureInput("");
    setBenefitInput("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    const item: any = {
      id: editingId || crypto.randomUUID(),
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      type: formData.type,
      duration: formData.duration,
      features: formData.features,
      benefits: formData.benefits,
      details: formData.details,
      sections: formData.sections,
      modules: [],
    };
    fd.append("item", JSON.stringify(item));
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await fetch("/api/trainings", {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });

      if (res.ok) {
        closeModal();
        fetchTrainings();
        Swal.fire({ title: "Success", text: "Training created!", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
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
      },
    });

    if (titleInput === currentTitle) {
      try {
        const res = await fetch(`/api/trainings?trainingId=${id}&title=${encodeURIComponent(currentTitle)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        });
        if (res.ok) {
          Swal.fire({ title: "Deleted!", text: "Training deleted.", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
          fetchTrainings();
        } else {
          Swal.fire({ title: "Error", text: "Failed to delete", icon: "error", background: "#0a0f0d", color: "#fff" });
        }
      } catch (e) {
        Swal.fire({ title: "Error", text: "Something went wrong", icon: "error", background: "#0a0f0d", color: "#fff" });
      }
    }
  };

  /* ---- Chip helpers ---- */
  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !formData.features.includes(val)) {
      setFormData({ ...formData, features: [...formData.features, val] });
      setFeatureInput("");
    }
  };
  const removeFeature = (idx: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });
  };
  const addBenefit = () => {
    const val = benefitInput.trim();
    if (val && !formData.benefits.includes(val)) {
      setFormData({ ...formData, benefits: [...formData.benefits, val] });
      setBenefitInput("");
    }
  };
  const removeBenefit = (idx: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== idx) });
  };

  /* ---- Section helpers ---- */
  const addSection = () => {
    setFormData({ ...formData, sections: [...formData.sections, { title: "", points: [""] }] });
  };
  const removeSection = (idx: number) => {
    setFormData({ ...formData, sections: formData.sections.filter((_, i) => i !== idx) });
  };
  const updateSectionTitle = (idx: number, title: string) => {
    const s = [...formData.sections];
    s[idx] = { ...s[idx], title };
    setFormData({ ...formData, sections: s });
  };
  const addSectionPoint = (sIdx: number) => {
    const s = [...formData.sections];
    s[sIdx] = { ...s[sIdx], points: [...s[sIdx].points, ""] };
    setFormData({ ...formData, sections: s });
  };
  const removeSectionPoint = (sIdx: number, pIdx: number) => {
    const s = [...formData.sections];
    s[sIdx] = { ...s[sIdx], points: s[sIdx].points.filter((_, i) => i !== pIdx) };
    setFormData({ ...formData, sections: s });
  };
  const updateSectionPoint = (sIdx: number, pIdx: number, value: string) => {
    const s = [...formData.sections];
    const pts = [...s[sIdx].points];
    pts[pIdx] = value;
    s[sIdx] = { ...s[sIdx], points: pts };
    setFormData({ ...formData, sections: s });
  };

  /* ---- Style constants ---- */
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
          <h1 className="text-3xl font-bold text-white mb-2">Trainings Management</h1>
          <p className="text-zinc-400">Manage all training programs and courses.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#00FF66] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#B6FF00] transition shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          <Plus size={20} /> Add Training
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((t) => (
            <div key={t.id} className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl flex flex-col overflow-hidden group hover:border-[#00FF66]/20 transition-colors">
              <div className="h-40 bg-zinc-900 overflow-hidden relative">
                {t.image ? (
                  <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <BookOpen size={32} className="opacity-30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/80 px-2.5 py-1 text-xs text-[#00FF66] rounded-lg backdrop-blur-md border border-[#1F3D2B] font-semibold flex items-center gap-1">
                  <Wifi size={10} />
                  {t.type || "Online"}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white mb-1.5 text-lg line-clamp-1">{t.title}</h3>
                  {t.subtitle && <p className="text-[#00FF66]/70 text-xs font-medium mb-2">{t.subtitle}</p>}
                  <p className="text-zinc-400 text-sm line-clamp-2">{t.description}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {t.features?.length > 0 && <span className="text-[10px] text-zinc-500 bg-[#1F3D2B]/30 px-2 py-0.5 rounded-full">{t.features.length} Features</span>}
                    {t.benefits?.length > 0 && <span className="text-[10px] text-zinc-500 bg-[#1F3D2B]/30 px-2 py-0.5 rounded-full">{t.benefits.length} Benefits</span>}
                    {t.sections?.length > 0 && <span className="text-[10px] text-zinc-500 bg-[#1F3D2B]/30 px-2 py-0.5 rounded-full">{t.sections.length} Sections</span>}
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-[#1F3D2B] flex justify-between items-center">
                  <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock size={12} />
                    {t.duration || "Self Paced"}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(t)} className="text-[#00FF66] hover:bg-[#00FF66]/10 p-2 rounded-lg transition" title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => handleDelete(t.id, t.title)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {trainings.length === 0 && (
            <div className="col-span-full border border-dashed border-[#1F3D2B] rounded-2xl py-16 text-center text-zinc-500">
              <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No trainings available.</p>
              <p className="text-xs text-zinc-600 mt-1">Click &quot;Add Training&quot; to create one.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ═══  ENHANCED TRAINING MODAL  ════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex justify-center items-start bg-black/85 backdrop-blur-md p-4 pt-8 overflow-y-auto">
          <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl w-full max-w-3xl shadow-[0_0_60px_rgba(0,255,102,0.08)] mb-8">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F3D2B]">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-[#00FF66]/10 rounded-lg">
                    <BookOpen size={20} className="text-[#00FF66]" />
                  </div>
                  {editingId ? "Edit Training" : "Create Training"}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">Fill in all the details for this training program.</p>
              </div>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white p-2 hover:bg-[#1F3D2B] rounded-lg transition">
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
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">

                {/* ──── TAB: BASIC INFO ──── */}
                {activeTab === "basic" && (
                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Title <span className="text-red-400">*</span></label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Extreme Web Penetration Testing"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. Advanced web penetration testing training"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    {/* Type & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className={inputClass}
                        >
                          <option value="Online">Online</option>
                          <option value="Offline">Offline</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Self Paced">Self Paced</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 4 Weeks, 40 Hours"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Features (Chips) */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Features</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.features.map((f, i) => (
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
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
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
                        {formData.benefits.map((b, i) => (
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
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
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
                        Cover Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full text-white file:bg-[#1F3D2B] file:text-[#00FF66] file:rounded-lg file:border-0 file:px-4 file:py-2 cursor-pointer file:hover:bg-[#1F3D2B]/80 file:transition text-sm bg-[#0d1a12] border border-[#1F3D2B] rounded-xl p-1"
                      />
                      {editingId && !imageFile && (
                        <p className="text-xs text-zinc-600 mt-1">Leave empty to keep the existing image.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ──── TAB: CONTENT & MEDIA ──── */}
                {activeTab === "content" && (
                  <div className="space-y-5">
                    {/* Description */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Description <span className="text-red-400">*</span></label>
                      <p className="text-[11px] text-zinc-600 mb-2">Short description shown on the training card and listing page.</p>
                      <textarea
                        rows={4}
                        placeholder="Brief overview of what this training covers..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClass} resize-none leading-relaxed`}
                      />
                      <p className="text-[10px] text-zinc-600 mt-1 text-right">{formData.description.length} characters</p>
                    </div>

                    {/* Details */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Detailed Content <span className="text-zinc-600">(optional)</span></label>
                      <p className="text-[11px] text-zinc-600 mb-2">Extended details shown on the training detail page. Supports paragraphs separated by blank lines.</p>
                      <textarea
                        rows={6}
                        placeholder="In-depth information about the training curriculum, methodology, prerequisites, and what participants will learn..."
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className={`${inputClass} resize-none leading-relaxed`}
                      />
                      <p className="text-[10px] text-zinc-600 mt-1 text-right">{formData.details.length} characters</p>
                    </div>
                  </div>
                )}

                {/* ──── TAB: SECTIONS ──── */}
                {activeTab === "sections" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">Content Sections</label>
                        <p className="text-[11px] text-zinc-600 mt-1">Add structured sections with title and bullet points (e.g. Methodology, Prerequisites).</p>
                      </div>
                      <button
                        type="button"
                        onClick={addSection}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#00FF66]/10 text-[#00FF66] rounded-xl text-xs font-bold border border-[#00FF66]/20 hover:bg-[#00FF66]/20 transition"
                      >
                        <Plus size={14} /> Add Section
                      </button>
                    </div>

                    {formData.sections.length === 0 && (
                      <div className="border border-dashed border-[#1F3D2B] rounded-xl p-8 text-center text-zinc-600">
                        <ListChecks size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No sections added yet. Click &quot;Add Section&quot; to create one.</p>
                      </div>
                    )}

                    {formData.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="bg-[#0d1a12] border border-[#1F3D2B] rounded-xl p-4 space-y-3 relative">
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
                              <button type="button" onClick={() => removeSectionPoint(sIdx, pIdx)} className="text-zinc-600 hover:text-red-400 p-1 transition mt-0.5" title="Remove point">
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
                  <span className={`px-2 py-0.5 rounded-full ${formData.title ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Title</span>
                  <span className={`px-2 py-0.5 rounded-full ${formData.description ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Desc</span>
                  <span className={`px-2 py-0.5 rounded-full ${formData.features.length > 0 ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Features</span>
                  <span className={`px-2 py-0.5 rounded-full ${formData.benefits.length > 0 ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Benefits</span>
                  <span className={`px-2 py-0.5 rounded-full ${formData.sections.length > 0 ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Sections</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="text-zinc-400 hover:text-white bg-[#1F3D2B]/20 px-6 py-3 rounded-xl transition font-medium text-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#B6FF00] shadow-[0_0_15px_rgba(0,255,102,0.2)] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                    {editingId ? "Update Training" : "Create Training"}
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
