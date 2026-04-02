"use client";
import React, { useEffect, useState } from "react";
import { Users, FileText, Briefcase, GraduationCap, ArrowUpRight, UserRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    blogs: 0,
    services: 0,
    trainings: 0,
    contacts: 0,
  });
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contentRes, trainingRes] = await Promise.all([
          fetch("/api/content", { cache: "no-store" }),
          fetch("/api/trainings", { cache: "no-store" })
        ]);
        
        const contentData = await contentRes.json();
        const trainingData = await trainingRes.json();

        setStats({
          blogs: contentData.blogs?.length || 0,
          services: contentData.services?.length || 0,
          trainings: Array.isArray(trainingData) ? trainingData.length : 0,
          contacts: contentData.contacts?.length || 0,
        });

        if (contentData.contacts && Array.isArray(contentData.contacts)) {
          const sorted = [...contentData.contacts].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          setRecentContacts(sorted.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Blogs", value: stats.blogs, icon: FileText, color: "#00FF66", href: "/dashboard/blogs" },
    { label: "Total Services", value: stats.services, icon: Briefcase, color: "#B6FF00", href: "/dashboard/services" },
    { label: "Total Trainings", value: stats.trainings, icon: GraduationCap, color: "#00FF66", href: "/dashboard/trainings" },
    { label: "Total Contacts", value: stats.contacts, icon: Users, color: "#B6FF00", href: "/dashboard/contacts" },
  ];

  const chartData = [
    { name: "Blogs", total: stats.blogs },
    { name: "Services", total: stats.services },
    { name: "Trainings", total: stats.trainings },
    { name: "Contacts", total: stats.contacts },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
          <p className="text-zinc-400">Welcome back. Here is your platform's high-level overview.</p>
        </div>
      </motion.div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FF66]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Link href={stat.href} className="block relative bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl p-6 hover:border-[#00FF66]/50 transition-colors h-full">
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <ArrowUpRight size={20} className="text-zinc-600 group-hover:text-[#00FF66] transition-colors" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">{stat.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#0a0f0d] border border-[#1F3D2B] rounded-3xl p-6 lg:p-8 flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Content Distribution</h3>
            <p className="text-sm text-zinc-400">Visual breakdown of your published modules</p>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF66" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00FF66" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3D2B" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#A1A1AA", fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#A1A1AA", fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: "#1F3D2B", opacity: 0.4 }}
                  contentStyle={{ backgroundColor: "#0a0f0d", borderColor: "#1F3D2B", borderRadius: "12px", color: "#fff" }}
                  itemStyle={{ color: "#00FF66", fontWeight: "bold" }}
                />
                <Bar dataKey="total" fill="url(#colorTotal)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column: Recent Contacts & Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8 flex flex-col"
        >
          {/* Recent Inquiries */}
          <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-3xl p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Inquiries</h3>
              <Link href="/dashboard/contacts" className="text-xs font-semibold text-[#00FF66] hover:text-white transition flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentContacts.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4 text-center">No recent inquiries.</p>
              ) : (
                recentContacts.map((contact, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#1F3D2B]/20 border border-[#1F3D2B]/50 hover:border-[#00FF66]/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#1F3D2B] flex items-center justify-center text-[#00FF66] shrink-0">
                      <UserRound size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{contact.email}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{new Date(contact.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Action Large Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/blogs" className="group bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl p-5 hover:border-[#00FF66]/50 transition-all text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#1F3D2B]/50 flex items-center justify-center text-[#00FF66] group-hover:scale-110 transition-transform mb-3">
                <FileText size={18} />
              </div>
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">New Blog</span>
            </Link>
            
            <Link href="/dashboard/trainings" className="group bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl p-5 hover:border-[#00FF66]/50 transition-all text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#1F3D2B]/50 flex items-center justify-center text-[#00FF66] group-hover:scale-110 transition-transform mb-3">
                <GraduationCap size={18} />
              </div>
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Add Training</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
