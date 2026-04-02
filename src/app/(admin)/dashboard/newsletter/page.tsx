"use client";
import { useEffect, useState } from "react";
import { Mail, Calendar } from "lucide-react";

export default function NewsletterManagement() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const token = localStorage.getItem("admin_token") || "";
        const res = await fetch("/api/newsletter", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setNewsletters(data.newsletters || []);
      } catch (err) {
        console.error("Failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Newsletter Subscribers</h1>
        <p className="text-zinc-400">View all users subscribed to the Fixity newsletter.</p>
      </div>

      {loading ? (
        <div className="flex justify-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin"></div></div>
      ) : (
        <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,102,0.05)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F3D2B] bg-[#1F3D2B]/30 text-zinc-400 text-sm">
                <th className="p-4 indent-2"><Mail size={16} className="inline mr-2" /> Email Address</th>
                <th className="p-4 hidden sm:table-cell">Source</th>
                <th className="p-4"><Calendar size={16} className="inline mr-2" /> Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {newsletters.map((n, i) => (
                <tr key={i} className="border-b border-[#1F3D2B] hover:bg-[#1F3D2B]/20 transition text-zinc-300">
                  <td className="p-4 font-medium text-white">{n.email}</td>
                  <td className="p-4 hidden sm:table-cell text-xs bg-zinc-900 inline-block px-2 py-1 rounded-md mt-4">{n.source || "Website"}</td>
                  <td className="p-4 text-xs text-zinc-500">{new Date(n.subscribedAt || Date.now()).toLocaleString()}</td>
                </tr>
              ))}
              {newsletters.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-zinc-500">No subscribers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
