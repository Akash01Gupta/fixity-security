"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Linkedin, ChevronDown } from "lucide-react";

const Footer = () => {
  const [open, setOpen] = useState(false);

  return (
    <footer className="text-gray-300 bg-gradient-to-r from-black via-[#0F1A14] to-black border-t border-[#1F3D2B]">
      <div className="mx-auto max-w-screen-xl px-5 py-5">

        {/* 5 Columns Layout */}
        <div className="grid gap-4 md:grid-cols-5">

          {/* Brand */}
          <div>
            <h2 className="text-lg font-extrabold mb-2 bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">
              FIXI SECURITY
            </h2>
            <p className="text-xs text-gray-400">
              Enterprise-grade cybersecurity solutions to protect your digital infrastructure.
            </p>
          </div>

          {/* Quick Links Dropdown */}
          <div>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 mb-2 text-xs font-semibold uppercase text-[#B6FF00]"
            >
              Quick Links
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <ul className="space-y-1 text-xs text-gray-400">
                <li><Link href="/aboutus" className="hover:text-white">About Us</Link></li>
                <li><Link href="/services" className="hover:text-white">Services</Link></li>
                <li><Link href="/training" className="hover:text-white">Training</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            )}
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-[#B6FF00]">
              Resources
            </h3>
            <ul className="space-y-1 text-xs text-gray-400">
              <li><Link href="/docs" className="hover:text-white">Docs</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>


          {/* Social */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-[#B6FF00]">
              Follow Us
            </h3>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/share/16CRhGYRXm/" target="_blank" rel="noopener noreferrer">
                <Facebook size={16} />
              </a>
              <a href="https://x.com/Fixi_Security" target="_blank" rel="noopener noreferrer">
                <Twitter size={16} />
              </a>
              <a href="https://www.linkedin.com/showcase/fixi-security/" target="_blank" rel="noopener noreferrer">
                <Linkedin size={16} />
              </a>
              <a href="https://www.instagram.com/fixi_security?igsh=dmxpN3J0eDNnZmM2" target="_blank" rel="noopener noreferrer">
                <Instagram size={16} />
              </a>
            </div>
          </div>
               {/* Legal */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-[#B6FF00]">
              Legal
            </h3>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>
                <Link href="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-40" />

        <p className="text-center text-xs text-gray-500">
          © 2026 Fixi Security. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;