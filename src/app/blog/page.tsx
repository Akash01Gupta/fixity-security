"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
}

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  // Admin stuff
  const role = useSelector((state: RootState) => state.auth.role);
  const isAdmin = role === "admin";
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Form states
  const fileRef = useRef<HTMLInputElement>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogDate, setBlogDate] = useState("");
  const [blogImage, setBlogImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/content");
      if (res.data?.blogs) {
        setBlogs(res.data.blogs);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle) return alert("Title is required");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("blog[title]", blogTitle.trim());
      formData.append("blog[excerpt]", blogExcerpt.trim());
      formData.append("blog[author]", blogAuthor.trim());
      formData.append("blog[category]", blogCategory.trim());
      // date removed, server auto gen
      if (blogImage) formData.append("blog[image]", blogImage);

      const res = await axios.put("/api/content", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        setShowModal(false);
        setBlogTitle("");
        setBlogExcerpt("");
        setBlogAuthor("");
        setBlogCategory("");
        setBlogDate("");
        setBlogImage(null);
        await fetchBlogs();
      } else {
        alert("Error saving blog: " + res.data?.error);
      }
    } catch (err: any) {
      alert("Error saving blog: " + (err?.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlog = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const blog = blogs.find(b => b.id === id);
    if (!blog) return;

    const { value: userInput } = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete this blog post, please type "${blog.title}":`,
      input: "text",
      inputPlaceholder: blog.title,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete Blog",
      background: "#18181b",
      color: "#fff",
      inputValidator: (value) => {
        if (!value) return "Title is required!";
        if (value !== blog.title) return "Title mismatch!";
      }
    });

    if (userInput) {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
        const res = await axios.delete(`/api/content?blogId=${id}&title=${encodeURIComponent(userInput)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) {
          setBlogs(prev => prev.filter(b => b.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Blog post has been removed.",
            icon: "success",
            background: "#18181b",
            color: "#fff",
            confirmButtonColor: "#00FF66"
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Error deleting blog.",
            icon: "error",
            background: "#18181b",
            color: "#fff"
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.error || err.message,
          icon: "error",
          background: "#18181b",
          color: "#fff"
        });
      }
    }
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#00FF66] transition";
  const labelCls = "block text-xs font-medium text-zinc-400 mb-1";

  return (
    <main className="min-h-screen bg-black text-white py-24 px-6 relative">
      <div className="p-4">
        <div className="max-w-7xl max-lg:max-w-4xl max-sm:max-w-sm mx-auto">
          {/* Header Section */}
          <div className="max-w-md mx-auto mb-12 text-center relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
              Our latest blog posts
            </h2>
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="mt-6 mx-auto bg-[#00FF66] text-black px-6 py-2.5 rounded-full font-semibold hover:bg-[#00cc52] transition shadow-[0_0_15px_rgba(0,255,102,0.4)] flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add New Blog
              </motion.button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF66]"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {blogs.length === 0 ? (
                  <p className="text-zinc-500 text-center col-span-full py-20">
                    No blog posts available at the moment.
                  </p>
                ) : (
                  blogs.slice(0, visibleCount).map((blog) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-black border border-gray-300 shadow-sm p-4 rounded-xl relative"
                    >
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteBlog(e, blog.id)}
                          className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg z-30"
                          title="Delete Blog"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <div className="bg-gray-50 aspect-[22/13] rounded-xl overflow-hidden">
                        <img
                          src={blog.image || "/services/cyber_security_abstract_1_1773654503262.png"}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-2 mt-6">
                        <h3 className="text-base font-semibold text-slate-00 mb-3 line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium mb-4">
                          {blog.date} | By {blog.author}
                        </p>
                        <a
                          href={`/blog/${blog.id}`}
                          className="inline-block px-4 py-1.5 tracking-wider bg-green-600 hover:bg-green-700 rounded-full text-white text-[13px] font-medium w-fit transition-colors"
                        >
                          Learn More
                        </a>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Load More Button */}
              {!loading && blogs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-4 pt-8 border-t border-zinc-800 text-center"
                >
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    disabled={visibleCount >= blogs.length}
                    className={`px-8 py-3 mt-4 font-semibold rounded-full transition-colors ${visibleCount >= blogs.length
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none border border-zinc-700"
                      : "bg-[#00FF66] text-black hover:bg-[#00cc52] shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                      }`}
                  >
                    {visibleCount >= blogs.length ? "All Blogs Loaded" : "Load More Blogs"}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Admin Add Blog Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white">Add New Blog</h2>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBlog} className="px-6 py-6 space-y-4">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input required className={inputCls} placeholder="Blog Title" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Excerpt</label>
                  <textarea rows={2} className={inputCls} placeholder="Short preview..." value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelCls}>Author</label>
                    <input className={inputCls} placeholder="Author Name" value={blogAuthor} onChange={e => setBlogAuthor(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Image</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
                    onChange={e => setBlogImage(e.target.files?.[0] || null)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full mt-4 bg-[#00FF66] text-black font-bold py-2.5 rounded-xl hover:bg-[#00cc52] transition disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Publish Blog"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default BlogPage;