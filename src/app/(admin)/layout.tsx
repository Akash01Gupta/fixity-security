"use client";

import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Just wrap children, no extra logic
  return <>{children}</>;
}