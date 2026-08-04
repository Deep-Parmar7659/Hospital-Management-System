"use client";

import { useState } from "react";
import { BedDouble, Users, HeartPulse, FileClock, LogOut } from "lucide-react";

const getInitialUserProfile = () => {
  if (typeof window === "undefined") {
    return {
      name: "User",
      email: "",
      role: "staff",
    };
  }

  const token = localStorage.getItem("nexus_token");
  const storedUser = localStorage.getItem("nexus_user");

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return {
        name: user.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        role: user.role || "staff",
      };
    } catch (e) {
      console.error("Error:", e);
    }
  }

  if (token) {
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
      const email = payload.sub || "";
      return {
        name: email.split("@")[0] || "User",
        email,
        role: payload.role || "staff",
      };
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  return {
    name: "User",
    email: "",
    role: "staff",
  };
};

export default function DashboardPage() {
  const [userProfile] = useState(() => getInitialUserProfile());
  const userName = userProfile.name;
  const userEmail = userProfile.email;
  const userRole = userProfile.role;
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "/login";
  };

  const initials = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2"> {/* Updated */}
            Welcome back, <span className="text-cyan-400">{userName}</span>
          </h1>
          <p className="text-gray-400">
            System operational. All modules nominal.
          </p>
        </div>

        {/* Clickable Profile - Built In */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-full bg-white/10 p-1 pr-3 hover:bg-white/20 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <span className="text-sm text-gray-300 hidden md:block">
              {userName}
            </span>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-white/10 shadow-xl z-20 py-2">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-gray-400">{userEmail}</p>
                  <p className="text-xs text-cyan-400 mt-1 capitalize">
                    {userRole}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Active Beds",
            value: "142/200",
            icon: BedDouble,
            color: "cyan",
          },
          { title: "On-Duty Staff", value: "48", icon: Users, color: "purple" },
          {
            title: "ICU Status",
            value: "85% Full",
            icon: HeartPulse,
            color: "red",
          },
          {
            title: "Pending Leaves",
            value: "12",
            icon: FileClock,
            color: "yellow",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-panel p-6 rounded-xl border border-white/10 bg-surface"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
              </div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface">
        <h2 className="text-xl font-bold text-white mb-6">
          Hospital Metrics (Weekly)
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-400 border border-white/5 rounded-lg">
          Chart coming soon
        </div>
      </div>
    </div>
  );
}
