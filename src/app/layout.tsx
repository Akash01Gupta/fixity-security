import type { Metadata } from "next";
import { ReduxProvider } from "@/store/provider";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fixity Security",
  description: "Your trusted partner in cybersecurity solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <ReduxProvider>
          <Navbar />

          <main className="pt-20 min-h-screen relative">
            {children}

            <Toaster
              position="top-center" 
              reverseOrder={false}
              toastOptions={{
                style: {
                  background: "#000",
                  color: "#00FF66",
                  border: "1px solid #1F3D2B",
                  minWidth: "300px",
                  textAlign: "center",
                },
              }}
            />
          </main>

          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}