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
        pattern: "[^@\\s]+@[^@\\s]+\\.[^@\\s]+",
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

    if (!formData.company.trim()) return toast.error("Company is required");
    if (!formData.name.trim()) return toast.error("Name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.contact.trim())
      return toast.error("Contact number is required");
    if (!formData.message.trim())
      return toast.error("Message is required");
    if (!captchaValue)
      return toast.error("Please complete the CAPTCHA.");

    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending message...");

    try {
      const res = await fetch(
        "https://fixi-backend.vercel.app/protected/appointment_registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.contact.trim(),
            specific: formData.message.trim(),
            company: formData.company.trim(),
            captchaToken: captchaValue,
          }),
        }
      );

      const data: ApiResponse = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to send message");

      recordSubmission();
      checkRateLimit();
      setFormData(initialState);
      setCaptchaValue(null);
      recaptchaRef.current?.reset();
      localStorage.removeItem(STORAGE_KEY);

      toast.success(
        data.message || "Message sent successfully!",
        { id: loadingToast }
      );
    } catch (error: unknown) {
      if (error instanceof Error)
        toast.error(error.message, { id: loadingToast });
      else toast.error("Something went wrong", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <section className="py-24 bg-black border-t border-[#1F3D2B]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
                   <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">

            Contact{" "}
            {/* <span className="bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent"> */}
              Us
            {/* </span> */}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-2xl bg-black/40 border border-[#1F3D2B] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map(({ label, name, icon: Icon, type, pattern }) => (
                <div key={name}>
                  <label className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                    <Icon className="w-4 h-4 text-[#00FF66]" />
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    required
                    pattern={pattern}
                    value={formData[name as keyof FormData]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black/50 border border-[#1F3D2B] rounded-md focus:border-[#00FF66] outline-none text-white"
                  />
                </div>
              ))}

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                  <MessageSquare className="w-4 h-4 text-[#00FF66]" />
                  Message*
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/50 border border-[#1F3D2B] rounded-md focus:border-[#00FF66] outline-none text-white"
                />
              </div>

              {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={
                    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
                  }
                  onChange={(value) => setCaptchaValue(value)}
                />
              ) : (
                <p className="text-red-500">
                  reCAPTCHA key is missing!
                </p>
              )}

              <button
                disabled={isSubmitting || ipLimitReached}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-black bg-gradient-to-r from-[#B6FF00] to-[#00FF66] disabled:opacity-40"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <InfoCard
              icon={Mail}
              title="Email"
              value="services@fixisecurity.com"
            />
            <InfoCard
              icon={Phone}
              title="Phone"
              value="+91 7277332211"
            />
            <InfoCard
              icon={Building2}
              title="Office"
              value="2nd Floor, Sai Ashish Trade Centre, Surat, Gujarat"
            />
          </div>
        </div>
      </div>
    </section>
  );
}