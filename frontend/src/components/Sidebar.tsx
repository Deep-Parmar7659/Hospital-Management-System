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
import { useState } from "react";

const getUserRoleFromToken = (): string => {
  if (typeof window === "undefined") return "staff";

  const token = localStorage.getItem("nexus_token");
  if (!token) return "staff";

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return "staff";

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
    return payload.role || "staff";
  } catch (error) {
    console.error("Error decoding token:", error);
    return "staff";
  }
};

// Define the navigation structure and required roles
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Staff Management",
    href: "/staff",
    icon: Users,
    roles: ["admin", "hr"],
  },
  {
    name: "Shift Scheduling",
    href: "/shifts",
    icon: Calendar,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Leave Requests",
    href: "/leaves",
    icon: FileText,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "hr"],
  },
  {
    name: "System Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole] = useState<string>(() => getUserRoleFromToken());

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "/login";
  };

  // Filter menu items based on the user's role
  const allowedNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <div className="flex h-full flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-xl p-4">
      {/* Logo Section */}
      <div>
        <div className="flex items-center gap-2 px-4 py-6">
          <Activity className="h-8 w-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">
            NEXUS <span className="text-cyan-400">HMS</span>
          </h1>
        </div>

        {/* Navigation Links */}
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
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout Section */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold uppercase">
            {userRole.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white capitalize">
              {userRole} User
            </span>
            <span className="text-xs text-gray-500">Nexus Hospital</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
