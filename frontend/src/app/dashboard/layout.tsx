"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#13131f] border-b border-white/10 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-300 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold text-cyan-400">NEXUS HMS</span>
        <div className="w-10" />
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full w-64
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">{children}</main>
    </div>
  );
}
