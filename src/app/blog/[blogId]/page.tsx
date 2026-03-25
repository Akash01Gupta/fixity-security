"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { motion, useScroll } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Twitter,
  Linkedin,
  Facebook,
  Instagram
} from "lucide-react"
import { platform } from "os"

interface Blog {
  id: string
  title: string
  content: string
  excerpt: string
  date: string
  author: string
  category: string
  image: string
  tags?: string[]
  readTime?: string
}

export default function BlogDetailPage() {
  const { blogId } = useParams()
  const router = useRouter()

  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([])

  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get("/api/content")
        const blogs = res.data?.blogs || []

        const found = blogs.find((b: Blog) => b.id === blogId)
        setBlog(found || null)

        if (found) {
          const related = blogs
            .filter((b: Blog) => b.id !== blogId && b.category === found.category)
            .slice(0, 3)
          setRelatedBlogs(related)
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
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
    window.open(urls[platform], "_blank")
  }

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
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-14">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#00FF66] mb-8"
          >
            <ArrowLeft size={15} />
            Back to Blog
          </button>

          {blog.category && (
            <span className="inline-block mb-5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-full">
              {blog.category}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
            {blog.title}
          </h1>

          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { Icon: User, label: blog.author || "Fixity Team" },
              { Icon: Calendar, label: blog.date },
              { Icon: Clock, label: blog.readTime || "5 min read" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-sm text-slate-300 bg-[#111] border border-slate-700 rounded-full px-3 py-1"
              >
                <Icon size={13} className="text-[#00FF66]" />
                {label}
              </div>
            ))}
          </div>

          {blog.image && (
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <img
                src={blog.image.startsWith("/") ? blog.image : `/${blog.image}`}
                alt={blog.title}
                className="w-full object-cover max-h-[480px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-16 flex gap-10 justify-center">

        {/* Share */}
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
              className="p-2.5 border border-slate-700 rounded-full text-slate-400 hover:text-[#00FF66]"
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <div className="w-full max-w-3xl">

          {blog.excerpt && (
            <p className="text-xl text-slate-400 border-l-4 border-[#00FF66] pl-6 mb-12">
              {blog.excerpt}
            </p>
          )}

          {/* Content */}
          <div>
            <style>{`
              .blog-content {
                color: #d1d5db;
                line-height: 1.9;
              }
              .blog-content h1,
              .blog-content h2,
              .blog-content h3 {
                color: #ffffff;
              }
              .blog-content p {
                color: #cbd5e1;
              }
              .blog-content pre {
                background: #020617;
                padding: 1rem;
                border-radius: 10px;
              }
            `}</style>

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && (
            <div className="mt-12 flex flex-wrap gap-2">
              {blog.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#111] text-slate-300 border border-slate-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="mt-14 p-6 bg-[#111] border border-slate-800 rounded-2xl flex gap-4 items-center">
            <div className="w-14 h-14 rounded-full bg-[#00FF66] flex items-center justify-center text-black font-bold">
              {(blog.author || "F")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold">{blog.author || "Fixity Team"}</p>
              <p className="text-sm text-slate-400">Security Expert</p>
            </div>
          </div>

          {/* Related */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-3 gap-5">
                {relatedBlogs.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/blog/${item.id}`)}
                    className="bg-[#111] border border-slate-800 rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.image}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-xs text-slate-400">{item.date}</p>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={() => router.push("/blog")}
              className="px-10 py-3 bg-[#00FF66] text-black font-bold rounded-full"
            >
              Explore More Articles
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}