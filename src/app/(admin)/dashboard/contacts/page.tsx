"use client";
import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  UserRound,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface ContactSub {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  specific?: string; // optional
  message?: string;  // fallback support
  createdAt?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setContacts(data.contacts || []);
        }
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!id) return;

    const { value: confirmText } = await Swal.fire({
      title: "Delete Contact?",
      text: `Type "yes" to delete contact from ${name}`,
      input: "text",
      inputPlaceholder: "yes",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      background: "#18181b",
      color: "#fff",
      inputValidator: (val) =>
        val !== "yes" ? "Type yes to confirm" : "",
    });

    if (confirmText === "yes") {
      try {
        const token =
          localStorage.getItem("admin_token") ||
          localStorage.getItem("token") ||
          "";

        const res = await fetch(`/api/contact?contactId=${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setContacts((prev) => prev.filter((c) => c._id !== id));

          Swal.fire({
            title: "Deleted!",
            text: "Contact removed.",
            icon: "success",
            background: "#18181b",
            color: "#fff",
            confirmButtonColor: "#00FF66",
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to delete contact.",
            icon: "error",
            background: "#18181b",
            color: "#fff",
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Server error.",
          icon: "error",
          background: "#18181b",
          color: "#fff",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Contact Submissions
        </h1>
        <p className="text-zinc-400">
          View and manage all inquiries submitted via the Contact Us form.
        </p>
      </div>

      <div className="bg-[#0a0f0d] border border-[#1F3D2B] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,102,0.02)]">
        {contacts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Mail size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-white mb-2">
              No contacts found
            </p>
            <p>
              Whenever someone submits a contact request, it will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1F3D2B]/30 border-b border-[#1F3D2B]">
                  <th className="px-6 py-4 text-sm text-zinc-300">Name</th>
                  <th className="px-6 py-4 text-sm text-zinc-300">Company</th>
                  <th className="px-6 py-4 text-sm text-zinc-300">Contact Info</th>
                  <th className="px-6 py-4 text-sm text-zinc-300">Message</th>
                  <th className="px-6 py-4 text-sm text-zinc-300">Date</th>
                  <th className="px-6 py-4 text-sm text-zinc-300 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact, idx) => {
                  const message =
                    contact.specific ||
                    contact.message ||
                    "No message";

                  return (
                    <motion.tr
                      key={contact._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-[#1F3D2B]/50 hover:bg-[#1F3D2B]/20"
                    >
                      {/* NAME */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1F3D2B] flex items-center justify-center text-[#00FF66]">
                            <UserRound size={14} />
                          </div>
                          <span className="text-white font-medium truncate max-w-[150px]">
                            {contact.name}
                          </span>
                        </div>
                      </td>

                      {/* COMPANY */}
                      <td className="px-6 py-4 text-zinc-400">
                        {contact.company || "N/A"}
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-4 space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Mail size={12} className="text-[#00FF66]" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Phone size={12} />
                          {contact.phone}
                        </div>
                      </td>

                      {/* MESSAGE */}
                      <td className="px-6 py-4">
                        <p
                          className="text-sm text-zinc-400 max-w-sm line-clamp-2 break-words cursor-pointer hover:text-white"
                          title={message}
                          onClick={() =>
                            Swal.fire({
                              title: "Message",
                              text: message,
                              background: "#18181b",
                              color: "#fff",
                            })
                          }
                        >
                          {message}
                        </p>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4 text-zinc-500 text-sm">
                        {contact.createdAt
                          ? new Date(
                            contact.createdAt
                          ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* DELETE */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDelete(contact._id!, contact.name)
                          }
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}