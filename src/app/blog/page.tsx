import React from "react";

const BlogPage = () => {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-10 
        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
        bg-clip-text text-transparent">
          Blog
        </h1>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-[#0F1A14]/80 border border-[#1F3D2B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              The Future of Cybersecurity in 2026
            </h2>
            <p className="text-gray-400 mb-4">
              Discover emerging cybersecurity trends and how enterprises can stay protected.
            </p>
            <button className="text-[#00FF66] hover:underline">
              Read More →
            </button>
          </div>

          <div className="bg-[#0F1A14]/80 border border-[#1F3D2B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              How to Prevent Data Breaches
            </h2>
            <p className="text-gray-400 mb-4">
              Essential strategies businesses must implement to secure their infrastructure.
            </p>
            <button className="text-[#00FF66] hover:underline">
              Read More →
            </button>
          </div>

        </div>

      </div>
    </main>
  );
};

export default BlogPage;