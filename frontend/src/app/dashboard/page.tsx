"use client";

import { useState } from "react";
import ProfileDropdown from "@/components/ProfileDropdown";
import {
  BedDouble,
  Users,
  HeartPulse,
  FileClock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function getUserSessionData() {
  if (typeof window === "undefined") {
    return { userName: "User", userRole: "staff" };
  }

  const storedUser = localStorage.getItem("nexus_user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return {
        userName: user.full_name
          ? user.full_name.split(" ")[0]
          : user.email?.split("@")[0] || "User",
        userRole: user.role || "staff",
      };
    } catch (error) {
      console.error("Error parsing user:", error);
    }
  }

  const token = localStorage.getItem("nexus_token");
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
      return {
        userName: payload.sub ? payload.sub.split("@")[0] : "User",
        userRole: payload.role || "staff",
      };
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  return { userName: "User", userRole: "staff" };
}

export default function DashboardPage() {
  const initialUserData = getUserSessionData();
  const [userName] = useState(initialUserData.userName);
  const [] = useState(initialUserData.userRole);

  const statCards = [
    {
      title: "Active Beds",
      value: "142/200",
      icon: BedDouble,
      color: "cyan",
      change: "+12%",
    },
    {
      title: "On-Duty Staff",
      value: "48",
      icon: Users,
      color: "purple",
      change: "+5%",
    },
    {
      title: "ICU Status",
      value: "85% Full",
      icon: HeartPulse,
      color: "red",
      change: "-3%",
    },
    {
      title: "Pending Leaves",
      value: "12",
      icon: FileClock,
      color: "yellow",
      change: "+2",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8">
      {/* Header with Clickable Profile */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-cyan-400">{userName}</span>
          </h1>
          <p className="text-gray-400">
            System operational. All modules nominal.
          </p>
        </div>
        {/* This is the clickable profile dropdown */}
        <ProfileDropdown />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="glass-panel p-6 rounded-xl border border-white/10 bg-surface"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                  Live
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
              <div className="flex items-center gap-1 text-xs">
                {stat.change.startsWith("+") ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span
                  className={
                    stat.change.startsWith("+")
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Hospital Metrics (Weekly)
          </h2>
          <select className="bg-background border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-300">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400 border border-white/5 rounded-lg">
          <div className="text-center">
            <p> Real-time chart coming soon</p>
            <p className="text-xs mt-2">Will display data from your database</p>
          </div>
        </div>
      </div>
    </div>
  );
}
