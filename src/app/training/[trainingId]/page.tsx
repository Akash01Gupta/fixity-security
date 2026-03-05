"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { defaultTrainingPrograms } from "@/component/Training";
import { ChevronLeft } from "lucide-react";

export default function TrainingSubPage() {
  const { trainingId } = useParams();
  const router = useRouter();

  const training = defaultTrainingPrograms.find((t) => t.id === trainingId);

  if (!training) {
    return (
      <div className="p-10 text-white">
        <h1 className="text-2xl font-bold mb-2">Training not found</h1>
        <button
          onClick={() => router.push("/training")}
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
          onClick={() => router.push("/training")}
          className="flex items-center gap-2 text-[#00FF66] hover:underline mb-4"
        >
          <ChevronLeft /> Go Back
        </button>

        {/* Title */}
        <h1 className="text-4xl font-bold">{training.title}</h1>

        {/* Subtitle */}
        {training.subtitle && (
          <h2 className="text-xl text-gray-400">{training.subtitle}</h2>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 rounded-full bg-[#00FF66]/20 text-[#00FF66]">{training.role}</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">{training.level}</span>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">{training.duration}</span>
        </div>

        {/* Description */}
        <p className="text-gray-300 mt-6">{training.description}</p>

        {/* Features & Benefits */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* Features Card */}
          {training.features?.length > 0 && (
            <div className="bg-zinc-900 border border-[#1F3D2B] rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,102,0.2)] transition">
              <h3 className="text-2xl font-semibold mb-3">Features</h3>
              <ul className="list-none space-y-2">
                {training.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="flex-shrink-0 h-3 w-3 bg-[#00FF66] rounded-full mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits Card */}
          {training.benefits?.length > 0 && (
            <div className="bg-zinc-900 border border-[#1F3D2B] rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,102,0.2)] transition">
              <h3 className="text-2xl font-semibold mb-3">Benefits</h3>
              <ul className="list-none space-y-2">
                {training.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                     <span className="flex-shrink-0 h-3 w-3 bg-[#00FF66] rounded-full mt-1" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Additional Details Card */}
        {training.details && (
          <div className="mt-10">
            <h3 className="text-2xl font-semibold mb-3">Additional Details</h3>
            <div className="bg-zinc-900 border border-[#1F3D2B] rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,102,0.2)] transition space-y-4">
              
              {/* Detail Description */}
              <p className="text-gray-300">{training.details.text || training.details}</p>

              {/* Detail Subtitle */}
              {training.details.subtitle && (
                <h4 className="text-xl font-semibold text-[#00FF66]">{training.details.subtitle}</h4>
              )}

              {/* Detail Features */}
              {training.details.features?.length > 0 && (
                <ul className="list-none space-y-2">
                  {training.details.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <span className="flex-shrink-0 h-3 w-3 bg-[#FFB800] rounded-full mt-1" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}