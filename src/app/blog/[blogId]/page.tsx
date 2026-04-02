"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { motion, useScroll } from "framer-motion"
import Swal from "sweetalert2"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Shield,
  Layout,
  ChevronRight,
  Edit3,
  Send,
  Eye
} from "lucide-react"

interface Blog {
  id: string
  title: string
  content: string
  excerpt: string[]
  date: string
  author: string
  category: string
  image: string
  tags?: string[]
  views?: number | string
  readTime?: string
}

export default function BlogDetailPage() {
  const { blogId } = useParams()
  const router = useRouter()

  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([])
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([])

  // Newsletter Logic
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)

  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get("/api/content")
        const blogs = res.data?.blogs || []

        const found = blogs.find((b: Blog) => b.id === blogId)

        if (found) {
          // Process content for TOC
          let processedContent = found.content || ""
          let extractedHeadings: { id: string; text: string }[] = []

          if (processedContent) {
            let count = 0
            processedContent = processedContent.replace(/<h2>(.*?)<\/h2>/g, (_match: string, text: string) => {
              const id = `heading-${count++}`
              extractedHeadings.push({ id, text: text.replace(/<[^>]*>?/gm, "") })
              return `<h2 id="${id}">${text}</h2>`
            })
          }

          setBlog({ ...found, content: processedContent })
          setHeadings(extractedHeadings)

          const related = blogs
            .filter((b: Blog) => b.id !== blogId && b.category === found.category)
            .slice(0, 3)
          setRelatedBlogs(related)
        } else {
          setBlog(null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (blogId) fetchBlog()
  }, [blogId])

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : ""

  const shareText = blog ? `Check out: ${blog.title}` : ""

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      instagram: `https://www.instagram.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
    window.open(urls[platform], "_blank")
  }

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      return Swal.fire({
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        icon: "warning",
        background: "#0B1220",
        color: "#fff",
        confirmButtonColor: "#00FF66"
      });
    }

    setIsSubscribing(true);
    try {
      const res = await axios.post("/api/newsletter", {
        email,
        source: `blog_detail_${blogId}`
      });

      if (res.status === 201 || res.data.status === "exists") {
        Swal.fire({
          title: res.data.status === "exists" ? "Already Subscribed!" : "Subscribed!",
          text: res.data.status === "exists" ? "You're already part of our elite security circle." : "Welcome to our elite security circle. Stay vigilant.",
          icon: "success",
          background: "#0B1220",
          color: "#fff",
          confirmButtonColor: "#00FF66"
        });
        setEmail("");
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to subscribe. Please try again later.",
        icon: "error",
        background: "#0B1220",
        color: "#fff",
        confirmButtonColor: "#EF4444"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-green-500">404</h1>
          <p className="mt-4 text-gray-400">Blog not found</p>
          <button
            onClick={() => router.push("/blog")}
            className="mt-6 px-6 py-2 bg-green-500 text-black rounded-full"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen">

      {/* Progress */}
      <motion.div
        className="fixed top-0 left-0 h-[3px] bg-[#00FF66] origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* HERO */}
      <div className="bg-[#0a0a0a] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 pt-15 pb-14">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#00FF66] mb-4"
          >
            <ArrowLeft size={15} />
            Back to Blog
          </button>

          {blog.category && (
            <span className="inline-block mb-5 px-3 py-1 text-xs   tracking-widest text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-full">
              {blog.category}
            </span>
          )}

          <h1 className="text-xl md:text-lg font-black leading-[1] mb-8 tracking-tighter ">
            {blog.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-12">
            {[
              { Icon: User, label: blog.author || "Fixity Team" },
              { Icon: Calendar, label: blog.date },
              { Icon: Clock, label: blog.readTime || "5 min read" },
              { Icon: Eye, label: `${blog.views || 0} Views` },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 border border-white/10 rounded-full px-5 py-2 backdrop-blur-md hover:bg-white/10 hover:border-[#00FF66]/30 transition-all cursor-default"
              >
                <Icon size={14} className="text-[#00FF66]" />
                <span className="font-semibold tracking-wide uppercase text-[10px]">{label}</span>
              </div>
            ))}
          </div>

          {blog.image && (
            <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#0B1220]/50 mt-12 mb-16">
              {/* Blurred Background Layer (The "Clean Looking Blur") */}
              <div className="absolute inset-0 scale-125 blur-[100px] opacity-30 pointer-events-none">
                <img
                  src={blog.image.startsWith("/") ? blog.image : `/${blog.image}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Main Image Container (Fixed size aspect) */}
              <div className="relative aspect-video md:aspect-[21/9] overflow-hidden bg-black/40 backdrop-blur-md">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1000, ease: "easeOut" }}
                  src={blog.image.startsWith("/") ? blog.image : `/${blog.image}`}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col xl:flex-row gap-12 justify-center">

        {/* Share (Left Sticky) */}
        <div className="hidden lg:flex flex-col gap-3 sticky top-28 h-fit">
          {[
            { platform: "twitter", Icon: Twitter },
            { platform: "facebook", Icon: Facebook },
            { platform: "linkedin", Icon: Linkedin },
            { platform: "instagram", Icon: Instagram }
          ].map(({ platform, Icon }) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className="p-3 border border-slate-800 rounded-full text-slate-400 hover:text-[#00FF66] hover:bg-[#00FF66]/5 transition-all"
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="w-full max-w-3xl">

          {blog.excerpt && (
            <div
              className="blog-excerpt text-xl text-slate-400 border-l-4 border-[#00FF66] pl-8 mb-20 font-bold leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.excerpt }}
            />
          )}

          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="bg-[#0B1220]/50 backdrop-blur-xl border border-[#1F3D2B] p-8 md:p-12 rounded-[3.5rem] mb-24 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-[#00FF66]">
                <Shield size={120} />
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
                <span className="w-12 h-1 bg-[#00FF66] rounded-full"></span>
                Table of Contents
              </h3>

              <ul className="space-y-6">
                {headings.map((h, i) => (
                  <li
                    key={h.id}
                    className="flex gap-6 cursor-pointer group/link"
                    onClick={() => {
                      const el = document.getElementById(h.id)
                      if (el) {
                        const yOffset = -120
                        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
                        window.scrollTo({ top: y, behavior: "smooth" })
                      }
                    }}
                  >
                    <span className="text-[#00FF66] font-black text-2xl opacity-20 group-hover/link:opacity-100 transition-all font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-slate-300 group-hover/link:text-white group-hover/link:font-bold text-xl transition-all border-b border-transparent group-hover/link:border-[#00FF66]/30 py-1">
                      {h.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content */}
          <div
            className="blog-content"
            style={{
              color: '#cbd5e1',
              lineHeight: '2',
              fontSize: '1.2rem',
              letterSpacing: '0.01em'
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <style jsx>{`
            /* --- EXCERPT STYLING --- */
            .blog-excerpt {
              position: relative;
              padding: 2.5rem 0 2.5rem 3rem;
              margin-bottom: 5rem;
              border-left: 4px solid #00FF66;
            }
            .blog-excerpt :global(p) { margin-bottom: 2rem; line-height: 1.8; color: #cbd5e1; font-weight: 500; font-size: 1.25rem; }
            .blog-excerpt :global(h2), .blog-excerpt :global(h3) { font-size: 2rem; color: #ffffff; margin-top: 3rem; margin-bottom: 1.5rem; font-weight: 900; letter-spacing: -0.02em; }
            .blog-excerpt :global(h4) { font-size: 1.5rem; color: #00FF66; margin-top: 2.5rem; margin-bottom: 1.2rem; font-weight: 800; }
            
            .blog-excerpt :global(ul) { list-style-type: none; margin-bottom: 2.5rem; padding-left: 0; }
            .blog-excerpt :global(li) { margin-bottom: 1.2rem; position: relative; padding-left: 2rem; font-size: 0.875rem; color: #cbd5e1; font-weight: 500; line-height: 1.7; }
            .blog-excerpt :global(li::before) { content: "→"; position: absolute; left: 0; color: #00FF66; font-weight: 900; font-size: 1.1rem; }
            
            /* Nested Lists in Excerpt */
            .blog-excerpt :global(ul ul) { margin-top: 0.8rem; margin-bottom: 0.5rem; padding-left: 1.5rem; }
            .blog-excerpt :global(ul ul li) { font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.8rem; }
            .blog-excerpt :global(ul ul li::before) { content: "•"; font-size: 1.3rem; top: -1px; }

            .blog-excerpt :global(strong) { color: #ffffff; font-weight: 900; }
            .blog-excerpt :global(em) { color: #00FF66; font-style: italic; }
            
            /* --- CONTENT STYLING --- */
            .blog-content {
              font-variant-numeric: tabular-nums;
              text-rendering: optimizeLegibility;
              font-family: inherit;
            }

            .blog-content :global(h1), 
            .blog-content :global(h2), 
            .blog-content :global(h3),
            .blog-content :global(h4) {
              color: #ffffff;
              font-weight: 900;
              margin-top: 6rem;
              margin-bottom: 2.5rem;
              line-height: 1.2;
              letter-spacing: -0.04em;
            }
            .blog-content :global(h1) { font-size: 3.5rem; border-bottom: 2px solid rgba(0,255,102,0.1); padding-bottom: 2rem; }
            .blog-content :global(h2) { font-size: 2.8rem; color: #00FF66; position: relative; }
            .blog-content :global(h3) { font-size: 2.2rem; display: flex; items-center: center; gap: 0.5rem; }
            .blog-content :global(h3::before) { content: "#"; color: #00FF66; opacity: 0.5; }
            .blog-content :global(h4) { font-size: 1.8rem; color: #cbd5e1; border-left: 4px solid rgba(0,255,102,0.3); padding-left: 1.5rem; }
            
            .blog-content :global(p) { 
               margin-bottom: 2.5rem; 
               opacity: 0.95;
               line-height: 2;
               font-weight: 500;
               color: #cbd5e1;
               font-size: 1.15rem;
            }
            
            /* List Reset & Base */
            .blog-content :global(ul), .blog-content :global(ol) { margin-bottom: 4rem; padding-left: 0; }
            .blog-content :global(li) { 
               margin-bottom: 1.5rem; 
               padding-left: 2.5rem; 
               position: relative;
               color: #cbd5e1;
               font-weight: 500;
               line-height: 1.8;
               font-size: 0.875rem;
            }

            /* Unordered Lists */
            .blog-content :global(ul > li::before) {
               content: "→";
               position: absolute;
               left: 0;
               color: #00FF66;
               font-weight: 900;
               font-size: 1.2rem;
               line-height: 1;
            }

            /* Nested Lists (Subpoints) */
            .blog-content :global(ul ul) { margin-top: 1rem; margin-bottom: 1rem; padding-left: 1.5rem; border-left: 1px solid rgba(255,255,255,0.05); }
            .blog-content :global(ul ul li) { font-size: 0.75rem; opacity: 0.85; margin-bottom: 1rem; }
            .blog-content :global(ul ul li::before) { content: "•"; font-size: 1.3rem; top: -2px; }

            /* Ordered Lists */
            .blog-content :global(ol) { list-style-type: decimal; padding-left: 2.5rem; }
            .blog-content :global(ol li) { padding-left: 0.5rem; color: #cbd5e1; }
            .blog-content :global(ol li::marker) { color: #00FF66; font-weight: 900; font-size: 1.2rem; }
            
            .blog-content :global(strong) { color: #ffffff; font-weight: 900; }
            .blog-content :global(em) { color: #00FF66; opacity: 1; font-weight: 700; }
            .blog-content :global(u) { text-decoration-color: #00FF66; text-underline-offset: 10px; text-decoration-thickness: 3px; }
            
            /* Enhanced Blockquote */
            .blog-content :global(blockquote) { 
              border-left: 8px solid #00FF66; 
              padding: 4rem 5rem; 
              margin: 6rem 0; 
              background: linear-gradient(135deg, #0B1220 0%, #030712 100%);
              border-radius: 0 3rem 3rem 0;
              color: #f1f5f9;
              font-size: 1.8rem;
              font-style: italic;
              line-height: 1.6;
              box-shadow: 40px 40px 100px rgba(0,0,0,0.5);
              position: relative;
              overflow: hidden;
            }
            
            .blog-content :global(blockquote::after) {
               content: '"';
               position: absolute;
               top: -2rem;
               right: 2rem;
               font-size: 15rem;
               color: #00FF66;
               opacity: 0.05;
               font-family: serif;
               line-height: 1;
               pointer-events: none;
            }

            /* Summary Box / Highlight */
            .blog-content :global(.summary-box) {
              background: rgba(0, 255, 102, 0.03);
              border: 1px solid rgba(0, 255, 102, 0.2);
              border-radius: 2.5rem;
              padding: 4rem;
              margin: 6rem 0;
              position: relative;
            }
            .blog-content :global(.summary-box)::before {
              content: "KEY TAKEAWAY";
              position: absolute;
              top: -12px;
              left: 3rem;
              background: #00FF66;
              color: #000;
              padding: 4px 16px;
              border-radius: 8px;
              font-size: 0.7rem;
              font-weight: 900;
              letter-spacing: 0.1em;
            }

            .blog-content :global(pre) {
              background: #0B1220;
              padding: 3rem;
              border: 1px solid rgba(0,255,102,0.1);
              border-radius: 30px;
              margin: 5rem 0;
              overflow-x: auto;
              font-family: 'JetBrains Mono', monospace;
              font-size: 1rem;
              line-height: 1.7;
            }
          `}</style>

          {/* Tags */}
          {blog.tags && (
            <div className="mt-16 pt-8 border-t border-slate-800 flex flex-wrap gap-2">
              {blog.tags.map((tag, i) => (
                <span key={i} className="px-4 py-1.5 bg-[#111] text-slate-400 border border-slate-800 text-xs font-bold uppercase tracking-wider rounded-full hover:border-[#00FF66]/50 hover:text-white transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="mt-14 p-8 bg-[#0B1220]/50 border border-slate-800 rounded-3xl flex gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF66] to-[#00CC55] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#00FF66]/20">
              {(blog.author || "F")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-black text-white text-lg">By {blog.author || "Fixity Team"}</p>
              <p className="text-sm text-slate-400 font-medium">Cyber Security Consultant & Expert</p>
            </div>
          </div>

          <div className="text-center mt-20">
            <button onClick={() => router.push("/blog")} className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-[#00FF66] transition-all hover:scale-105 shadow-xl">
              EXPLORE MORE ARTICLES
            </button>
          </div>
        </div>

        {/* Right Sidebar (Sticky) */}
        <aside className="hidden xl:flex flex-col gap-10 w-[340px] sticky top-28 h-fit">

          {/* Categories */}
          <div className="bg-[#0B1220]/50 backdrop-blur-md border border-slate-800/50 p-8 rounded-[2rem]">
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest flex items-center justify-between">
              Categories
              <Layout size={20} className="text-[#00FF66]" />
            </h3>
            <div className="space-y-2">
              {['Network Security', 'Cyber Threat', 'Cloud Infrastructure', 'Compliance'].map((cat) => (
                <button
                  key={cat}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group text-slate-400 hover:text-white text-left"
                >
                  <span className="text-sm font-bold uppercase tracking-tight">{cat}</span>
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Other Articles (Recent/Related) */}
          <div className="bg-[#0B1220]/50 backdrop-blur-md border border-slate-800/50 p-8 rounded-[2rem]">
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest flex items-center justify-between">
              Our Posts
              <Edit3 size={20} className="text-[#00FF66]" />
            </h3>
            <div className="space-y-8">
              {relatedBlogs.slice(0, 4).map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => router.push(`/blog/${item.id}`)}>
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-800">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-black text-[#00FF66] tracking-tighter opacity-80">{item.date}</p>
                    <h4 className="text-sm font-black leading-snug group-hover:text-[#00FF66] transition-colors line-clamp-2">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="bg-gradient-to-br from-[#0B1220] to-[#040812] border border-[#00FF66]/20 p-10 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00FF66]/5 rounded-full blur-3xl group-hover:bg-[#00FF66]/10 transition-all duration-700" />
            <h3 className="text-2xl font-black mb-3">Newsletter</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">Subscribe to our newsletter and receive the latest security updates.</p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                placeholder="Your Email Address"
                className="w-full bg-black/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/20 outline-none transition-all pr-14 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="absolute right-2 top-2 p-3 bg-[#00FF66] text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00FF66]/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubscribing ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={20} className="fill-current" />
                )}
              </button>
            </form>
          </div>

        </aside>
      </div>
    </div>
  )
}