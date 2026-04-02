import type { Metadata } from "next";
import { ReduxProvider } from "@/store/provider";
import LayoutWrapper from "@/component/LayoutWrapper";
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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}