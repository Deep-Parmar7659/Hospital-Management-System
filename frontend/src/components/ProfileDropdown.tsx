"use client";

import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";

type UserProfile = {
  full_name?: string;
  email?: string;
  role?: string;
};

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const storedUser = localStorage.getItem("nexus_user");
      return storedUser ? (JSON.parse(storedUser) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "/login";
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/10 p-1 pr-3 hover:bg-white/20 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-linear-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {user.full_name?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className="text-sm text-gray-300 hidden md:block">
          {user.full_name || "User"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-white/10 shadow-xl z-20 py-2">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <p className="text-xs text-cyan-400 mt-1 capitalize">
                {user.role}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                <User className="h-4 w-4" />
                View Profile
              </button>
              {user.role === "admin" && (
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
