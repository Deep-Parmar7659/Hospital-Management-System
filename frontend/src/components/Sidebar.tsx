"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

function getStoredUserProfile() {
  if (typeof window === "undefined") {
    return { userName: "User", userRole: "staff" };
  }

  try {
    const storedUser = localStorage.getItem("nexus_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        userName: user.full_name || user.email?.split("@")[0] || "User",
        userRole: user.role || "staff",
      };
    }

    const token = localStorage.getItem("nexus_token");
    if (token) {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        const payload = JSON.parse(jsonPayload);
        return {
          userName: payload.full_name || payload.sub?.split("@")[0] || "User",
          userRole: payload.role || "staff",
        };
      }
    }
  } catch (error) {
    console.error("Error reading user profile:", error);
  }

  return { userName: "User", userRole: "staff" };
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const initialUserProfile = getStoredUserProfile();

  // 1. Start with default server-safe values, then hydrate from localStorage
  const [userName] = useState(initialUserProfile.userName);
  const [userRole] = useState(initialUserProfile.userRole);
  const [mounted, setMounted] = useState(false);

  // 2. Only track mount state for client-only rendering
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "/login";
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "commander", "hr", "staff"],
    },
    {
      name: "Staff Management",
      href: "/staff",
      icon: Users,
      roles: ["admin", "commander", "hr"],
    },
    {
      name: "Shift Scheduling",
      href: "/shifts",
      icon: Calendar,
      roles: ["admin", "commander", "hr", "staff"],
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: Clock,
      roles: ["admin", "commander", "hr", "staff"],
    },
    {
      name: "Leave Requests",
      href: "/leaves",
      icon: FileText,
      roles: ["admin", "commander", "hr", "staff"],
    },
    {
      name: "Payroll",
      href: "/payroll",
      icon: DollarSign,
      roles: ["admin", "commander", "hr", "staff"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["admin", "commander", "hr"],
    },
    {
      name: "System Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin", "commander"],
    },
  ];

  const allowedNav = navigation.filter((item) => item.roles.includes(userRole));

  // 3. Prevent hydration mismatch by rendering a simple skeleton until mounted
  if (!mounted) {
    return (
      <div className="relative flex h-full">
        <div className="flex h-full w-full flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 px-4 py-6">
            <Activity className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              NEXUS <span className="text-cyan-400">HMS</span>
            </h1>
          </div>
          <div className="mt-6 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 p-2 text-gray-400 hover:text-white md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-xl p-4">
      <div>
        <div className="flex items-center gap-2 px-4 py-6">
          <Activity className="h-8 w-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">
            NEXUS <span className="text-cyan-400">HMS</span>
          </h1>
        </div>

        <nav className="mt-6 space-y-2">
          {allowedNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold uppercase">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-sm font-medium text-white truncate"
              title={userName}
            >
              {userName}
            </span>
            <span className="text-xs text-gray-500 capitalize">{userRole}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
