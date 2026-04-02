"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";

export default function FeaturesManagement() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: "", title: "", description: "", icon: "" });

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const data = await res.json();
      setFeatures(data.whyChooseUs || []);
    } catch (err) {
      console.error("Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token") || "";
      let res;
      if (editMode) {
        res = await fetch("/api/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ whyChooseUs: [{ title: formData.title, description: formData.description, icon: formData.icon }] }),
        });
      }

      if (res.ok) {
        setShowModal(false);
        setFormData({ id: "", title: "", description: "", icon: "" });
        setEditMode(false);
        fetchFeatures();
        Swal.fire({ title: "Success", text: `Feature ${editMode ? "updated" : "created"}!`, icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
      } else {
        const err = await res.json();
        Swal.fire("Error", err.error || "Failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleEdit = (f: any) => {
    setFormData({ id: f.id, title: f.title, description: f.description, icon: f.icon || "" });
    setEditMode(true);
    setShowModal(true);
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
        const token = localStorage.getItem("admin_token") || "";
        const res = await fetch(`/api/content?featureId=${id}&title=${encodeURIComponent(currentTitle)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          Swal.fire({ title: "Deleted!", text: "Feature deleted.", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
          fetchFeatures();
        } else {
          Swal.fire("Error", "Failed to delete", "error");
        }
      } catch (e) {
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Features Management</h1>
          <p className="text-zinc-400">Manage 'Why Choose Us' features.</p>
        </div>
        <button onClick={() => { setEditMode(false); setFormData({ id: "", title: "", description: "", icon: "" }); setShowModal(true); }} className="flex items-center gap-2 bg-[#00FF66] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#B6FF00]">
          <Plus size={20} /> Add Feature
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
             <div key={f.id} className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl p-6 group shadow-[0_0_20px_rgba(0,255,102,0.05)] hover:shadow-[0_0_30px_rgba(0,255,102,0.1)] transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 bg-[#1F3D2B]/30 rounded-xl flex items-center justify-center text-3xl">{f.icon || "✨"}</div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(f)} className="text-[#00FF66] hover:text-[#B6FF00] p-2 bg-[#1F3D2B]/50 rounded-lg"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(f.id, f.title)} className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg"><Trash2 size={16}/></button>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
             </div>
          ))}
          {features.length === 0 && <div className="col-span-full py-10 text-center text-zinc-500">No features found.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl w-full max-w-lg p-6 shadow-[0_0_40px_rgba(0,255,102,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-6">{editMode ? "Edit Feature" : "Create Feature"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-transparent border-b border-zinc-700 text-white p-2 focus:border-[#00FF66] outline-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Icon (Emoji or text)</label>
                <input required type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full bg-transparent border-b border-zinc-700 text-white p-2 focus:border-[#00FF66] outline-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <textarea rows={4} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-transparent border border-zinc-700 rounded-lg text-white p-3 focus:border-[#00FF66] outline-none resize-none"></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-zinc-400 hover:text-white transition">Cancel</button>
                 <button type="submit" className="flex-1 py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#B6FF00]">{editMode ? "Save Changes" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
