import React from "react";

const DocsPage = () => {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-10 
        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
        bg-clip-text text-transparent">
          Documentation
        </h1>

        <div className="bg-[#0F1A14]/80 border border-[#1F3D2B] rounded-xl p-8">
          <p className="text-gray-300 mb-6">
            Welcome to FIXI SECURITY documentation. Here you will find guides,
            setup instructions, cybersecurity resources, and product documentation.
          </p>

          <ul className="space-y-4 text-gray-300">
            <li className="border-b border-[#1F3D2B] pb-3">
              🔐 Getting Started Guide
            </li>
            <li className="border-b border-[#1F3D2B] pb-3">
              🛡 Security Best Practices
            </li>
            <li className="border-b border-[#1F3D2B] pb-3">
              ⚙ API Documentation
            </li>
            <li>
              🚀 Deployment Instructions
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
};

export default DocsPage;