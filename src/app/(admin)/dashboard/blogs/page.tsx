"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X, FileText, Sparkles, ImageIcon, BookOpen, Calendar, User, Tag, Heading2, Heading3, List, Quote, Info, Eye } from "lucide-react";
import Swal from "sweetalert2";

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
}

const emptyForm: BlogFormData = {
  title: "",
  excerpt: "",
  content: "",
  author: "FixiSecurity",
  category: "General",
  tags: [],
};

const CATEGORIES = ["General", "AI Security", "Cloud Security", "Cryptography", "FinTech Security", "API Security", "Autonomous", "Network Security"];

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({ ...emptyForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Chip input
  const [tagInput, setTagInput] = useState("");

  // Active form tab
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "preview">("basic");

  // Selection tracking for toolbar
  const [lastFocusedId, setLastFocusedId] = useState<string>("excerpt");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openModal = () => {
    setFormData({ ...emptyForm });
    setImageFile(null);
    setTagInput("");
    setActiveTab("basic");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ ...emptyForm });
    setImageFile(null);
    setTagInput("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append("blog[title]", formData.title);
    fd.append("blog[excerpt]", formData.excerpt);
    fd.append("blog[content]", formData.content);
    fd.append("blog[author]", formData.author);
    fd.append("blog[category]", formData.category);
    if (formData.tags.length > 0) {
      fd.append("blog[tags]", JSON.stringify(formData.tags));
    }
    if (imageFile) fd.append("blog[image]", imageFile);

    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        closeModal();
        fetchBlogs();
        Swal.fire({ title: "Success", text: "Blog created!", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
      } else {
        const err = await res.json();
        Swal.fire({ title: "Error", text: err.error || "Failed to create blog", icon: "error", background: "#0a0f0d", color: "#fff" });
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
        const token = localStorage.getItem("admin_token") || "";
        const res = await fetch(`/api/content?blogId=${id}&title=${encodeURIComponent(currentTitle)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          Swal.fire({ title: "Deleted!", text: "Blog has been deleted.", icon: "success", background: "#0a0f0d", color: "#fff", confirmButtonColor: "#00FF66" });
          fetchBlogs();
        } else {
          Swal.fire({ title: "Error", text: "Failed to delete", icon: "error", background: "#0a0f0d", color: "#fff" });
        }
      } catch (e) {
        Swal.fire({ title: "Error", text: "Something went wrong", icon: "error", background: "#0a0f0d", color: "#fff" });
      }
    }
  };

  /* ---- Tag chip helpers ---- */
  const addTag = () => {
    const val = tagInput.trim();
    if (val && !formData.tags.includes(val)) {
      setFormData({ ...formData, tags: [...formData.tags, val] });
      setTagInput("");
    }
  };
  const removeTag = (idx: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) });
  };

  /* ---- HTML Toolbar Helpers ---- */
  const insertTag = (tag: string, closeTag?: string, isBlock = false) => {
    const el = document.getElementById(lastFocusedId) as HTMLTextAreaElement;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end);
    
    let replacement = "";
    if (isBlock) {
      replacement = `\n<${tag}>${selectedText || "text here"}</${closeTag || tag}>\n`;
    } else {
      replacement = `<${tag}>${selectedText}</${closeTag || tag}>`;
    }

    const newVal = text.substring(0, start) + replacement + text.substring(end);
    
    const field = lastFocusedId === "excerpt" ? "excerpt" : "content";
    setFormData({ ...formData, [field]: newVal });

    // Refocus and set selection (slight delay to let React render)
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + (selectedText.length || 9));
    }, 10);
  };

  const HtmlToolbar = () => (
    <div className="flex flex-wrap gap-1.5 mb-2 p-1.5 bg-[#050706] border border-[#1F3D2B] rounded-xl">
      <button type="button" onClick={() => insertTag("h2", "h2", true)} className="p-2 hover:bg-[#1F3D2B] rounded-lg text-zinc-400 hover:text-[#00FF66] transition group relative" title="Heading 2">
        <Heading2 size={16} />
      </button>
      <button type="button" onClick={() => insertTag("h3", "h3", true)} className="p-2 hover:bg-[#1F3D2B] rounded-lg text-zinc-400 hover:text-[#00FF66] transition" title="Heading 3">
        <Heading3 size={16} />
      </button>
      <div className="w-px h-6 bg-[#1F3D2B] my-1 mx-1"></div>
      <button type="button" onClick={() => insertTag("ul>\n  <li>", "li>\n</ul", true)} className="p-2 hover:bg-[#1F3D2B] rounded-lg text-zinc-400 hover:text-[#00FF66] transition" title="Bullet List">
        <List size={16} />
      </button>
      <button type="button" onClick={() => insertTag("li", "li", true)} className="p-2 hover:bg-[#1F3D2B] rounded-lg text-zinc-400 hover:text-[#00FF66] transition" title="List Item">
        <Plus size={14} />
      </button>
      <div className="w-px h-6 bg-[#1F3D2B] my-1 mx-1"></div>
      <button type="button" onClick={() => insertTag("blockquote", "blockquote", true)} className="p-2 hover:bg-[#1F3D2B] rounded-lg text-zinc-400 hover:text-[#00FF66] transition" title="Quote">
        <Quote size={16} />
      </button>
      <button type="button" onClick={() => insertTag('div class="summary-box"', "div", true)} className="p-2 hover:bg-[#1F3D2B] rounded-lg text-zinc-400 hover:text-[#00FF66] transition" title="Summary Box">
        <Info size={16} />
      </button>
      <div className="ml-auto flex items-center gap-2 px-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
        Editing: <span className="text-[#00FF66]">{lastFocusedId}</span>
      </div>
    </div>
  );

  /* ---- Style constants ---- */
  const inputClass = "w-full bg-[#0d1a12] border border-[#1F3D2B] rounded-xl text-white px-4 py-2.5 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/20 outline-none transition placeholder:text-zinc-600 text-sm";

  const tabBtn = (tab: "basic" | "content" | "preview", label: string, icon: React.ReactNode) => (
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
          <h1 className="text-3xl font-bold text-white mb-2">Blogs Management</h1>
          <p className="text-zinc-400">Manage all blog posts from here.</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 bg-[#00FF66] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#B6FF00] transition shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          <Plus size={20} /> Create Blog
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,102,0.05)]">
          <table className="w-full text-left bg-transparent border-collapse">
            <thead>
              <tr className="border-b border-[#1F3D2B] bg-[#1F3D2B]/30 text-zinc-400 text-sm">
                <th className="p-4 indent-2">Image</th>
                <th className="p-4">Title</th>
                <th className="p-4 hidden md:table-cell">Category</th>
                <th className="p-4 hidden md:table-cell">Author</th>
                <th className="p-4 hidden md:table-cell">Date</th>
                <th className="p-4 text-center text-red-500">Delete</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-b border-[#1F3D2B] hover:bg-[#1F3D2B]/20 transition text-zinc-300 group">
                  <td className="p-4">
                    {blog.image ? (
                      <img src={blog.image} alt="blog" className="w-16 h-12 object-cover rounded-lg border border-[#1F3D2B]" />
                    ) : (
                      <div className="w-16 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500">No Img</div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-white max-w-xs">
                    <p className="truncate">{blog.title}</p>
                    {blog.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {blog.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span key={i} className="text-[9px] bg-[#1F3D2B]/40 text-zinc-500 px-1.5 py-0.5 rounded">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="bg-[#1F3D2B]/30 text-[#00FF66] px-2.5 py-1 rounded-lg text-xs font-semibold">{blog.category}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-zinc-400">{blog.author}</td>
                  <td className="p-4 hidden md:table-cell text-sm text-zinc-500">{blog.date}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDelete(blog.id, blog.title)}
                        className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No blogs found.</p>
                    <p className="text-xs text-zinc-600 mt-1">Create one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ═══  ENHANCED BLOG MODAL  ════════════════════════════ */}
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
                  Create New Blog
                </h2>
                <p className="text-zinc-500 text-sm mt-1">Write and publish a new blog post.</p>
              </div>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white p-2 hover:bg-[#1F3D2B] rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-4 border-b border-[#1F3D2B]/50 bg-[#050706]">
              {tabBtn("basic", "Basic Info", <FileText size={15} />)}
              {tabBtn("content", "Content & Body", <Sparkles size={15} />)}
              {tabBtn("preview", "Live Preview", <Eye size={15} />)}
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
                        placeholder="e.g. The Rise of AI-Driven Cyber Attacks"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    {/* Category & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className={inputClass}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">
                          <User size={12} className="inline mr-1" />
                          Author
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Sarah Chen"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Tags (Chips) */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">
                        <Tag size={12} className="inline mr-1" />
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((t, i) => (
                          <span key={i} className="flex items-center gap-1.5 bg-[#00FF66]/10 text-[#00FF66] px-3 py-1 rounded-full text-xs font-semibold border border-[#00FF66]/20">
                            #{t}
                            <button type="button" onClick={() => removeTag(i)} className="hover:text-white transition"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a tag and press Add"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                          className={inputClass}
                        />
                        <button type="button" onClick={addTag} className="px-4 py-2 bg-[#1F3D2B] text-[#00FF66] rounded-xl text-xs font-bold hover:bg-[#1F3D2B]/80 transition whitespace-nowrap">
                          <Plus size={14} className="inline mr-1" />Add
                        </button>
                      </div>
                    </div>

                    {/* Cover Image */}
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
                    </div>
                  </div>
                )}

                {/* ──── TAB: CONTENT & BODY ──── */}
                {activeTab === "content" && (
                  <div className="space-y-5">
                    <HtmlToolbar />
                    
                    {/* Excerpt */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Excerpt / Summary <span className="text-red-400">*</span></label>
                      <p className="text-[11px] text-zinc-600 mb-2">A brief summary displayed on the blog listing page and as the introductory block. Supports HTML.</p>
                      <textarea
                        required
                        id="excerpt"
                        rows={5}
                        placeholder="Write a compelling excerpt..."
                        value={formData.excerpt}
                        onFocus={() => setLastFocusedId("excerpt")}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className={`${inputClass} resize-none leading-relaxed`}
                      />
                    </div>

                    {/* Full Content */}
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block font-semibold uppercase tracking-wider">Full Content <span className="text-zinc-600">(HTML supported)</span></label>
                      <textarea
                        id="content"
                        rows={12}
                        placeholder={"<h2>Introduction</h2>\n<p>Your opening paragraph here...</p>"}
                        value={formData.content}
                        onFocus={() => setLastFocusedId("content")}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className={`${inputClass} resize-none leading-relaxed font-mono text-xs`}
                      />
                    </div>
                  </div>
                )}

                {/* ──── TAB: PREVIEW ──── */}
                {activeTab === "preview" && (
                  <div className="space-y-12 pb-12 bg-[#020403] rounded-xl p-8 border border-[#1F3D2B]/50">
                    <div>
                      <h4 className="text-[#00FF66] text-[10px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#00FF66]/20 pb-2">Introductory Excerpt</h4>
                      <div className="preview-excerpt" dangerouslySetInnerHTML={{ __html: formData.excerpt }} />
                    </div>

                    <div className="pt-8 border-t border-[#1F3D2B]">
                      <h4 className="text-[#00FF66] text-[10px] font-black uppercase tracking-[0.2em] mb-8 border-b border-[#00FF66]/20 pb-2">Main Body Content</h4>
                      <div className="preview-content" dangerouslySetInnerHTML={{ __html: formData.content }} />
                    </div>

                    <style jsx>{`
                      .preview-excerpt { border-left: 4px solid #00FF66; padding-left: 2rem; color: #cbd5e1; }
                      .preview-excerpt :global(p) { margin-bottom: 1.5rem; line-height: 1.8; }
                      .preview-excerpt :global(h2), .preview-excerpt :global(h3) { color: #fff; font-weight: 900; margin: 2rem 0 1rem; font-size: 1.5rem; }
                      .preview-excerpt :global(ul) { list-style-type: none; padding-left: 0; margin-bottom: 2rem; }
                      .preview-excerpt :global(li) { position: relative; padding-left: 1.5rem; margin-bottom: 0.8rem; font-size: 0.875rem; }
                      .preview-excerpt :global(li::before) { content: "→"; position: absolute; left: 0; color: #00FF66; font-weight: 900; }
                      .preview-excerpt :global(ul ul) { margin-top: 0.5rem; padding-left: 1rem; }
                      .preview-excerpt :global(ul ul li) { font-size: 0.75rem; }

                      .preview-content { color: #cbd5e1; line-height: 1.8; }
                      .preview-content :global(h2) { color: #00FF66; font-size: 2rem; font-weight: 900; margin-top: 4rem; margin-bottom: 2rem; }
                      .preview-content :global(h3) { color: #fff; font-size: 1.6rem; font-weight: 900; margin-top: 3rem; margin-bottom: 1.5rem; }
                      .preview-content :global(p) { margin-bottom: 2rem; }
                      .preview-content :global(ul) { list-style-type: none; padding-left: 0; margin-bottom: 3rem; }
                      .preview-content :global(li) { position: relative; padding-left: 2rem; margin-bottom: 1rem; font-size: 0.875rem; }
                      .preview-content :global(li::before) { content: "→"; position: absolute; left: 0; color: #00FF66; font-weight: 900; font-size: 1.2rem; }
                      .preview-content :global(ul ul) { margin-top: 1rem; padding-left: 1.5rem; }
                      .preview-content :global(ul ul li) { font-size: 0.75rem; }
                      .preview-content :global(ul ul li::before) { content: "•"; font-size: 1.5rem; top: -2px; }
                      .preview-content :global(blockquote) { 
                        border-left: 6px solid #00FF66; 
                        padding: 2rem 3rem; 
                        margin: 4rem 0; 
                        background: rgba(0,255,102,0.03);
                        font-style: italic;
                        font-size: 1.4rem;
                        border-radius: 0 1.5rem 1.5rem 0;
                      }
                      .preview-content :global(.summary-box) {
                        background: rgba(0, 255, 102, 0.05);
                        border: 1px solid rgba(0, 255, 102, 0.2);
                        border-radius: 2rem;
                        padding: 2.5rem;
                        margin: 4rem 0;
                        position: relative;
                      }
                      .preview-content :global(.summary-box)::before {
                        content: "KEY TAKEAWAY";
                        position: absolute;
                        top: -10px;
                        left: 2rem;
                        background: #00FF66;
                        color: #000;
                        padding: 2px 10px;
                        border-radius: 4px;
                        font-size: 0.6rem;
                        font-weight: 900;
                      }
                    `}</style>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 p-6 border-t border-[#1F3D2B] bg-[#050706] rounded-b-2xl">
                <div className="flex gap-1.5 text-[10px] text-zinc-600 font-medium">
                  <span className={`px-2 py-0.5 rounded-full ${formData.title ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Title</span>
                  <span className={`px-2 py-0.5 rounded-full ${formData.excerpt ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Excerpt</span>
                  <span className={`px-2 py-0.5 rounded-full ${formData.content ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Content</span>
                  <span className={`px-2 py-0.5 rounded-full ${formData.tags.length > 0 ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Tags</span>
                  <span className={`px-2 py-0.5 rounded-full ${imageFile ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-zinc-800 text-zinc-500"}`}>Image</span>
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
                    Publish Blog
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
