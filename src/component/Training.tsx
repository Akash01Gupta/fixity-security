"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ChevronRight, ShieldCheck, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

export default function Training() {

  const router = useRouter();
  const isAdmin = useSelector((state: RootState) => state.auth.role === "admin");

  const [trainings, setTrainings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [newTraining, setNewTraining] = useState<any>({
    title: "",
    subtitle: "",
    benefits: [],
    features: [],
    details: "",
    sections: [

      {

        title: "",
        // description: "",
        points: []
      }
    ],
    image: ""
  });

  // ---------------- FETCH TRAININGS ----------------
  const fetchTrainings = async () => {
    try {
      const res = await axios.get("/api/trainings");
      setTrainings(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  // ---------------- ADD TRAINING ----------------
  const handleAddTraining = async () => {

    if (!newTraining.title) {
      alert("Title required");
      return;
    }

    const newItem = {
      ...newTraining,
      id: crypto.randomUUID()
    };

    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";

      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append("item", JSON.stringify(newItem));
        formData.append("image", imageFile);
        
        res = await axios.post("/api/trainings", formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      } else {
        res = await axios.post("/api/trainings", { item: newItem }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        const savedItem = res.data.item || newItem;
        setTrainings([...trainings, savedItem]);
        setShowForm(false);

        setNewTraining({
          title: "",
          subtitle: "",
          benefits: [],
          features: [],
          details: "",
          sections: [
            {
              title: "",
              // description: "",
              points: []
            }
          ],
          image: ""
        });
        setImageFile(null);
      }

    } catch (err: any) {
      console.error(err);
      alert("Error adding training: " + (err?.response?.data?.error || err.message));
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: string) => {
    const training = trainings.find(t => t.id === id);
    if (!training) return;

    const { value: userInput } = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete this training, please type "${training.title}":`,
      input: "text",
      inputPlaceholder: training.title,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete Training",
      background: "#18181b",
      color: "#fff",
      inputValidator: (value) => {
        if (!value) return "Title is required!";
        if (value !== training.title) return "Title mismatch!";
      }
    });

    if (userInput) {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token");

        const res = await axios.delete(`/api/trainings?trainingId=${id}&title=${encodeURIComponent(userInput)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setTrainings(trainings.filter((t: any) => t.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Training has been removed.",
            icon: "success",
            background: "#18181b",
            color: "#fff",
            confirmButtonColor: "#00FF66"
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.data.error || "Error deleting training.",
            icon: "error",
            background: "#18181b",
            color: "#fff"
          });
        }

      } catch (err: any) {
        console.error(err);
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.error || "Failed to delete training.",
          icon: "error",
          background: "#18181b",
          color: "#fff"
        });
      }
    }
  };

  const handleExplore = (id: string) => {
    router.push(`/training/${id}`);
  };

  // ---------------- RENDER ----------------
  return (
    <section className="py-24 bg-black min-h-screen">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-[#B6FF00] to-[#00FF66] bg-clip-text text-transparent">

            Enterprise Security Training
          </h2>
        </div>

        {/* ADMIN BUTTON */}
        {isAdmin && (
          <div className="text-center mb-10">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
              text-black font-semibold rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Add Training
            </button>
          </div>
        )}

        {/* TRAINING GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {trainings.map((training) => (

            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                boxShadow: "0 0 25px rgba(0, 255, 102, 0.25), 0 15px 35px rgba(0, 0, 0, 0.4)",
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              whileTap={{ scale: 0.97 }}
              className="bg-black border border-zinc-700 shadow-lg p-4 rounded-xl relative hover:border-[#00FF66] transition-all duration-300 cursor-pointer"
              style={{ perspective: 1000 }}
            >
              {isAdmin && (
                <button
                  onClick={() => handleDelete(training.id)}
                  className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg z-30"
                  title="Delete Training"
                >
                  <X size={16} />
                </button>
              )}

              {/* IMAGE */}
              <motion.div 
                className="bg-zinc-800 aspect-[22/13] rounded-xl overflow-hidden cursor-pointer"
                onClick={() => handleExplore(training.id)}
                whileHover={{ boxShadow: "0 0 20px rgba(0, 255, 102, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src={training.image ? (training.image.startsWith("/") ? training.image : `/${training.image}`) : "/services/cyber_security_abstract_1_1773654503262.png"}
                  alt={training.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {/* CONTENT */}
              <div className="px-2 mt-6">
                {/* TITLE */}
                <motion.h3 
                  className="text-base font-semibold text-white mb-3 line-clamp-2 cursor-pointer transition-colors"
                  onClick={() => handleExplore(training.id)}
                  whileHover={{ color: "#00FF66", x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  {training.title}
                </motion.h3>

                {/* SUBTITLE */}
                <motion.p 
                  className="text-zinc-400 text-sm font-medium mb-4 line-clamp-3 cursor-pointer transition-colors"
                  whileHover={{ color: "#d4d4d8" }}
                  transition={{ duration: 0.2 }}
                >
                  {training.subtitle || "Enterprise security training program."}
                </motion.p>

                {/* BUTTON */}
                <motion.button
                  onClick={() => handleExplore(training.id)}
                  className="inline-block px-4 py-1.5 tracking-wider bg-[#00FF66] hover:bg-[#00cc52] rounded-full text-black text-[13px] font-bold w-fit transition-colors"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Explore Program
                </motion.button>
              </div>

            </motion.div>

          ))}

        </div>

        {/* ADD TRAINING MODAL */}
        <AnimatePresence>

          {showForm && (

            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >

              <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md space-y-3">

                <div className="flex justify-between">
                  <h3 className="font-semibold">Add Training</h3>
                  <button onClick={() => setShowForm(false)}>
                    <X />
                  </button>
                </div>

                {/* TITLE */}
                <input
                  placeholder="Title"
                  value={newTraining.title}
                  onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black border rounded"
                />

                {/* SUBTITLE */}
                <input
                  placeholder="Subtitle"
                  value={newTraining.subtitle}
                  onChange={(e) => setNewTraining({ ...newTraining, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-black border rounded"
                />

               

                {/* FEATURES */}
                <input
                  placeholder="Features (comma separated)"
                  onChange={(e) => setNewTraining({
                    ...newTraining,
                    features: e.target.value.split(",").map(f => f.trim())
                  })}
                  className="w-full px-4 py-2 bg-black border rounded"
                />

                {/* BENEFITS */}
                <input
                  placeholder="Benefits (comma separated)"
                  onChange={(e) => setNewTraining({
                    ...newTraining,
                    benefits: e.target.value.split(",").map(b => b.trim())
                  })}
                  className="w-full px-4 py-2 bg-black border rounded"
                />

                 {/* DETAILS */}
                <textarea
                  placeholder="Training Details"
                  rows={3}
                  value={newTraining.details}
                  onChange={(e) => setNewTraining({ ...newTraining, details: e.target.value })}
                  className="w-full px-4 py-2 bg-black border rounded"
                />

                {/* SECTION TITLE */}
                <input
                  placeholder="Section Title"
                  onChange={(e) => {
                    const sections = [...newTraining.sections]
                    sections[0].title = e.target.value
                    setNewTraining({ ...newTraining, sections })
                  }}
                  className="w-full px-4 py-2 bg-black border rounded"
                />

               

                {/* SECTION POINTS */}
                <input
                  placeholder="Section Points (comma separated)"
                  onChange={(e) => {
                    const sections = [...newTraining.sections]
                    sections[0].points = e.target.value.split(",").map(p => p.trim())
                    setNewTraining({ ...newTraining, sections })
                  }}
                  className="w-full px-4 py-2 bg-black border rounded"
                />

                {/* IMAGE */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file);
                      setNewTraining({
                        ...newTraining,
                        image: URL.createObjectURL(file)
                      });
                    }
                  }}
                  className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
                />

                {/* {newTraining.image && (
                  <img
                    src={newTraining.image}
                    className="w-full h-40 object-cover rounded"
                  />
                )} */}

                <button
                  onClick={handleAddTraining}
                  className="w-full py-2 bg-gradient-to-r from-[#B6FF00] to-[#00FF66]
                  text-black font-semibold rounded"
                >
                  Save Training
                </button>

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>
    </section>
  );
}