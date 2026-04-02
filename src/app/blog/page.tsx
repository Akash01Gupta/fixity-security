"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ArrowBigRight, ArrowBigRightDashIcon, ArrowRight, ChevronRight, Eye, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface Blog {
  id: string;
  title: string;
  excerpt: {
    heading: string;
    content: string;
  }[];
  date: string;
  author: string;
  category: string;
  image: string;
  views: number | string;
}

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  const router = useRouter();

const fetchBlogs = async () => {
  try {
    setLoading(true);
    const res = await axios.get("/api/content");

    if (res.data?.blogs) {
      const formatted = res.data.blogs.map((b: any) => {
        let parsedExcerpt = [];

        if (typeof b.excerpt === "string") {
          try {
            const parsed = JSON.parse(b.excerpt);

            // If valid JSON array
            if (Array.isArray(parsed)) {
              parsedExcerpt = parsed;
            } else {
              // fallback if parsed but not array
              parsedExcerpt = [
                { heading: "Overview", content: b.excerpt }
              ];
            }
          } catch (err) {
            //  NOT JSON → fallback
            parsedExcerpt = [
              { heading: "Overview", content: b.excerpt }
            ];
          }
        } else if (Array.isArray(b.excerpt)) {
          parsedExcerpt = b.excerpt;
        }

        return {
          ...b,
          excerpt: parsedExcerpt
        };
      });

      setBlogs(formatted);
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



  return (
    <main className="min-h-screen bg-black text-white py-24 px-6 relative">
      <div className="p-4">
        <div className="max-w-7xl max-lg:max-w-4xl max-sm:max-w-sm mx-auto">
          {/* Header Section */}
          <div className="max-w-md mx-auto mb-12 text-center relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
              Our Blog Posts
            </h2>

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
                  blogs.slice(0, visibleCount).map((blog, i) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -8 }}
                      viewport={{ once: true }}
                      onClick={() => router.push(`/blog/${blog.id}`)}
                      className="group bg-black border border-white/10 shadow-2xl p-6 rounded-[2.5rem] relative cursor-pointer hover:border-[#00FF66]/30 transition-all duration-500"
                    >

                      <div className="bg-zinc-900 aspect-[1.7] rounded-[1.5rem] overflow-hidden">
                        <motion.img
                          src={blog.image ? (blog.image.startsWith("/") ? blog.image : `/${blog.image}`) : "/services/cyber_security_abstract_1_1773654503262.png"}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="mt-8 px-1">
                        <h3 className="text-[18px] font-bold text-white mb-6 leading-tight tracking-tight group-hover:text-[#00FF66] transition-colors">
                          {blog.title}
                        </h3>

                        <div className="space-y-3 mb-0">
                          <div className="flex items-center gap-2.5 text-slate-400 text-[14px] font-medium tracking-tight">
                            <Calendar size={17} className="text-[#00FF66]" />
                            {blog.date}
                            <span className="text-slate-700 font-black ml-1"></span>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-400 text-[14px] font-medium tracking-tight">
                            <span>By {blog.author}</span>
                            <span className="text-slate-700 font-black"></span>
                            <span className="flex items-center gap-1.5"><Eye size={17} className="text-[#00FF66]" /> {blog.views || 0} Views</span>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-3 text-[#00FF66] font-black text-[10px]  tracking-[0.2em] group-hover:gap-5 transition-all duration-500">
                          <ChevronRight size={16} className="stroke-[2]" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Load More Button */}
              {!loading && blogs.length > 8 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-4 pt-8 border-t border-zinc-800 text-center"
                >
                  {visibleCount < blogs.length ? (
                    <button
                      onClick={() => setVisibleCount(prev => prev + 8)}
                      className="px-8 py-3 mt-4 font-semibold rounded-full transition-colors bg-[#00FF66] text-black hover:bg-[#00cc52] shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                    >
                      Load More Blogs
                    </button>
                  ) : (
                    <button
                      onClick={() => setVisibleCount(8)}
                      className="px-8 py-3 mt-4 font-semibold rounded-full transition-colors bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 shadow-xl"
                    >
                      Show Less
                    </button>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default BlogPage;