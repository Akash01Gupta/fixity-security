"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase, GraduationCap, Star, Mail, MessageSquare, UserCircle } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Blogs", href: "/dashboard/blogs", icon: FileText },
    { name: "Services", href: "/dashboard/services", icon: Briefcase },
    { name: "Trainings", href: "/dashboard/trainings", icon: GraduationCap },
    { name: "Features", href: "/dashboard/features", icon: Star },
    { name: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
    { name: "Contacts", href: "/dashboard/contacts", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  ];

  return (
    <aside className="w-64 bg-[#0a0f0d] border-r border-[#1F3D2B] h-screen fixed left-0 top-0 flex flex-col text-zinc-300">
      <div className="h-16 flex items-center px-6 border-b border-[#1F3D2B]">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
          Fixity Admin
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname?.startsWith(`${link.href}/`) && link.href !== '/dashboard');
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#00FF66]/10 text-[#00FF66] font-medium shadow-[0_0_10px_rgba(0,255,102,0.1)]"
                  : "hover:bg-[#1F3D2B]/50 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
