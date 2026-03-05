"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { defaultServices } from "@/component/Services"; // make sure defaultServices is exported
import { ChevronLeft } from "lucide-react";

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const router = useRouter();

  const service = defaultServices.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="p-10 text-white">
        <h1 className="text-2xl font-bold mb-2">Service not found</h1>
        <button
          onClick={() => router.push("/services")}
          className="mt-4 px-4 py-2 bg-[#00FF66] text-black rounded hover:bg-[#b6ff00]/90 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <section className="py-24 bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-6 text-white space-y-8">

        {/* Go Back */}
        <button
          onClick={() => router.push("/services")}
          className="flex items-center gap-2 text-[#00FF66] hover:underline mb-4"
        >
          <ChevronLeft /> Go Back
        </button>

        {/* Title */}
        <h1 className="text-4xl font-bold">{service.title}</h1>

        {/* Subtitle */}
        {service.subtitle && (
          <h2 className="text-xl text-gray-400">{service.subtitle}</h2>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {service.role && (
            <span className="px-3 py-1 rounded-full bg-[#00FF66]/20 text-[#00FF66]">{service.role}</span>
          )}
          {service.level && (
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">{service.level}</span>
          )}
          {service.duration && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">{service.duration}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-300 mt-6">{service.description}</p>

        {/* Features & Sub-Services */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* Features Card */}
          {service.features?.length > 0 && (
            <div className="bg-zinc-900 border border-[#1F3D2B] rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,102,0.2)] transition">
              <h3 className="text-2xl font-semibold mb-3">Features</h3>
              <ul className="list-none space-y-2">
                {service.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="flex-shrink-0 h-3 w-3 bg-[#00FF66] rounded-full mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sub-Services Card */}
          {service.subServices?.length > 0 && (
            <div className="bg-zinc-900 border border-[#1F3D2B] rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,102,0.2)] transition">
              <h3 className="text-2xl font-semibold mb-3">Sub-Services</h3>
              <ul className="list-none space-y-2">
                {service.subServices.map((sub) => (
                  <li key={sub.id} className="flex flex-col gap-1 text-gray-300">
                    <span className="font-semibold text-[#00FF66]">{sub.title}</span>
                    <span className="text-sm">{sub.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}