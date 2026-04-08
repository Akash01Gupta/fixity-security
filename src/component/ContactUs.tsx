"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mail,
  Phone,
  User,
  MessageSquare,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";

/* ---------------- CONSTANTS ---------------- */
const STORAGE_KEY = "contact_form_data";
const SUBMISSION_KEY = "submission_history";
const RATE_LIMIT = 20;

/* ---------------- TYPES ---------------- */
interface FormData {
  company: string;
  name: string;
  email: string;
  contact: string;
  message: string;
}

interface SubmissionRecord {
  timestamp: number;
}

interface ApiResponse {
  message: string;
}

/* ---------------- INITIAL STATE ---------------- */
const initialState: FormData = {
  company: "",
  name: "",
  email: "",
  contact: "",
  message: "",
};

/* ---------------- INFO CARD ---------------- */
function InfoCard({
  icon: Icon,
  title,
  value,
}: {
  icon?: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-black/40 border border-[#1F3D2B] p-6 hover:border-[#00FF66] transition">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-2 rounded-lg bg-[#00FF66]/10">
            <Icon className="w-5 h-5 text-[#00FF66]" />
          </div>
        )}
        <div>
          <h4 className="text-white font-semibold mb-1">{title}</h4>
          <p className="text-gray-400 text-sm">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ContactUs() {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ipLimitReached, setIpLimitReached] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  /* ---------------- SAFE PARSE ---------------- */
  const safeParse = useCallback((value: string | null) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }, []);

  /* ---------------- RATE LIMIT ---------------- */
  const checkRateLimit = useCallback(() => {
    const history: SubmissionRecord[] =
      safeParse(localStorage.getItem(SUBMISSION_KEY)) || [];

    const now = Date.now();
    const recent = history.filter(
      (h) => now - h.timestamp < 60 * 60 * 1000
    );

    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(recent));
    setIpLimitReached(recent.length >= RATE_LIMIT);
  }, [safeParse]);

  const recordSubmission = useCallback(() => {
    const history: SubmissionRecord[] =
      safeParse(localStorage.getItem(SUBMISSION_KEY)) || [];

    history.push({ timestamp: Date.now() });
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(history));

    if (history.length >= RATE_LIMIT) setIpLimitReached(true);
  }, [safeParse]);

  /* ---------------- LOAD SAVED FORM ---------------- */
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (saved) setFormData(saved);
    checkRateLimit();
  }, [safeParse, checkRateLimit]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      // Only numbers allowed for contact
      if (name === "contact" && !/^\d*$/.test(value)) return;

      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  /* ---------------- FORM FIELDS ---------------- */
  const fields = useMemo(
    () => [
      { label: "Company*", name: "company", icon: Building2, type: "text" },
      { label: "Name*", name: "name", icon: User, type: "text" },
      {
        label: "Email*",
        name: "email",
        icon: Mail,
        type: "email",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      },
      { label: "Contact*", name: "contact", icon: Phone, type: "tel" },
    ],
    []
  );

  /* ---------------- HANDLE SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ipLimitReached)
      return toast.error("Submission limit reached. Try again later.");
    if (isSubmitting) return;

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    // Trim values
    const name = formData.name.trim();
    const email = formData.email.trim();
    const contact = formData.contact.trim();
    const message = formData.message.trim();
    const company = formData.company.trim();

    // Validation
    if (!company) return toast.error("Company is required");

    if (!name || name.length < 2)
      return toast.error("Enter valid name");

    if (!email || !emailRegex.test(email))
      return toast.error("Invalid email format");

    if (!contact || !phoneRegex.test(contact))
      return toast.error("Invalid contact number (10 digits)");

    if (!message || message.length < 10)
      return toast.error("Message must be at least 10 characters");

    if (!captchaValue)
      return toast.error("Please complete the CAPTCHA.");

    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending message...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: contact,
          specific: message,
          company,
          captchaToken: captchaValue,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      recordSubmission();
      checkRateLimit();

      setFormData(initialState);
      setCaptchaValue(null);
      recaptchaRef.current?.reset();
      localStorage.removeItem(STORAGE_KEY);

      toast.success(data.message || "Message sent successfully!", {
        id: loadingToast,
      });
    } catch (error: any) {
      toast.error(error.message || "Something went wrong", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <section className="relative py-24 bg-black overflow-hidden group/section">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,102,0.05)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(182,255,0,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
        {/* Animated Bloom */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#00FF66]/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[#B6FF00]/10 blur-[120px] rounded-full"
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-5 text-sm font-medium text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/20 rounded-full"
          >
            Get In Touch
          </motion.span>
          <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent mb-4">
            Contact Us
          </h2>
          <p className="max-w-xl mx-auto text-gray-400 text-base leading-relaxed">
            Reach out to our team for any security inquiries or support.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1F3D2B] to-[#00FF66]/20 rounded-3xl blur opacity-20" />
            <div className="relative bg-[#050505]/80 backdrop-blur-xl border border-[#1F3D2B] p-8 md:p-10 rounded-3xl shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {fields.map(({ label, name, icon: Icon, type, pattern }) => (
                    <div key={name} className="relative group/input">
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-1.5">
                        <Icon className="w-4 h-4 text-[#00FF66]" />
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type={type}
                          name={name}
                          required
                          pattern={name === "contact" ? "[6-9]{1}[0-9]{9}" : pattern}
                          maxLength={name === "contact" ? 10 : undefined}
                          value={formData[name as keyof FormData]}
                          onChange={handleChange}
                          autoComplete="off"
                          className="w-full px-5 py-3.5 bg-black/60 border border-[#1F3D2B] rounded-xl focus:border-[#00FF66] focus:ring-4 focus:ring-[#00FF66]/5 outline-none text-white text-sm transition-all duration-300 placeholder:text-zinc-600 group-hover/input:border-[#00FF66]/30 shadow-inner"
                        />
                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] transition-all duration-500 group-focus-within/input:w-full" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative group/input">
                  <label className="flex items-center gap-2 text-sm text-gray-300 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-[#00FF66]" />
                    Message*
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-black/60 border border-[#1F3D2B] rounded-xl focus:border-[#00FF66] focus:ring-4 focus:ring-[#00FF66]/5 outline-none text-white text-sm transition-all duration-300 placeholder:text-zinc-600 group-hover/input:border-[#00FF66]/30 shadow-inner resize-none"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] transition-all duration-500 group-focus-within/input:w-full" />
                  </div>
                </div>

                {/* reCAPTCHA */}
                <div className="pt-2">
                  {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      theme="dark"
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                      onChange={(value) => setCaptchaValue(value)}
                    />
                  ) : (
                    <p className="text-red-500 text-xs font-bold uppercase tracking-tighter">
                      reCAPTCHA Configuration Missing
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  disabled={isSubmitting || ipLimitReached}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-black bg-gradient-to-r from-[#B6FF00] to-[#00FF66] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-6"
          >
            {[
              { icon: Mail, title: "Email", value: "services@fixisecurity.com", desc: "For direct technical inquiries" },
              { icon: Phone, title: "Phone", value: "+91 7277332211", desc: "Available for urgent queries" },
              { icon: Building2, title: "Office", value: "2nd Floor, Sai Ashish Trade Centre, Surat, Gujarat", desc: "Our headquarters" },
            ].map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="group/card"
              >
                <div className="relative p-6 rounded-2xl bg-[#0A0A0A] border border-[#1F3D2B] hover:border-[#00FF66] transition-all duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                    <info.icon size={60} />
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="p-3.5 rounded-xl bg-[#00FF66]/5 text-[#00FF66] border border-[#00FF66]/10 group-hover/card:bg-[#00FF66]/10 group-hover/card:scale-110 transition-all duration-500">
                      <info.icon size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#00FF66] mb-1">{info.title}</h4>
                      <p className="text-white text-sm mb-1">{info.value}</p>
                      <p className="text-gray-400 text-xs">{info.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Security Note */}
            <div className="mt-2 p-6 rounded-2xl bg-[#1F3D2B]/10 border border-[#1F3D2B]/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                <span className="text-sm font-medium text-[#00FF66]">Secure & Private</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                All communications are encrypted with SSL. Your data is kept private and never shared.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}