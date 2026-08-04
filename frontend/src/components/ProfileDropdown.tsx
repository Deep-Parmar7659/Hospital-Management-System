"use client";

import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";

type StoredUser = {
  email?: string;
  role?: string;
  full_name?: string;
};

const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem("nexus_user");
    if (storedUser) {
      return JSON.parse(storedUser) as StoredUser;
    }
  } catch (e) {
    console.error("Error parsing user:", e);
  }

  const token = localStorage.getItem("nexus_token");
  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);

    return {
      email: payload.sub,
      role: payload.role || "staff",
      full_name: payload.sub?.split("@")[0] || "User",
    };
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useState<StoredUser | null>(() => getStoredUser());

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "/login";
  };

  if (!user) {
    return (
      <div className="h-10 w-10 rounded-full bg-linear-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold">
        ?
      </div>
    );
  }

  const initials = (user.full_name || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      {/* Clickable Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/10 p-1 pr-3 hover:bg-white/20 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-linear-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
        <span className="text-sm text-gray-300 hidden md:block">
          {user.full_name || user.email?.split("@")[0]}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-white/10 shadow-xl z-20 py-2">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white">
                {user.full_name || "User"}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <p className="text-xs text-cyan-400 mt-1 capitalize">
                {user.role}
              </p>
            </div>

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
