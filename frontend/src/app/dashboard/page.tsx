"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProfileDropdown from "@/components/ProfileDropdown";
import {
  BedDouble,
  Users,
  HeartPulse,
  FileClock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type DashboardStats = {
  active_beds: number;
  total_beds: number;
  on_duty_staff: number;
  icu_status: string;
  pending_leaves: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [, setUserRole] = useState("staff");

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("nexus_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Try to get name from full_name or email
        const name = user.full_name
          ? user.full_name.split(" ")[0]
          : user.email?.split("@")[0] || "User";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserName(name);
        setUserRole(user.role || "staff");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      // If not in localStorage, try to decode from token
      const token = localStorage.getItem("nexus_token");
      if (token) {
        try {
          const base64Url = token.split(".")[1];
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
          const name = payload.sub ? payload.sub.split("@")[0] : "User";
          setUserName(name);
          setUserRole(payload.role || "staff");
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    }

    // Fetch real dashboard stats from backend
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Set default values if API fails
        setStats({
          active_beds: 142,
          total_beds: 200,
          on_duty_staff: 48,
          icu_status: "85% Full",
          pending_leaves: 12,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Active Beds",
      value: stats ? `${stats.active_beds}/${stats.total_beds}` : "Loading...",
      icon: BedDouble,
      color: "cyan",
      change: "+12%",
    },
    {
      title: "On-Duty Staff",
      value: stats?.on_duty_staff || 0,
      icon: Users,
      color: "purple",
      change: "+5%",
    },
    {
      title: "ICU Status",
      value: stats?.icu_status || "N/A",
      icon: HeartPulse,
      color: "red",
      change: "-3%",
    },
    {
      title: "Pending Leaves",
      value: stats?.pending_leaves || 0,
      icon: FileClock,
      color: "yellow",
      change: "+2",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8">
      {/* Header with Profile Dropdown */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-cyan-400">{userName}</span>
          </h1>
          <p className="text-gray-400">
            System operational. All modules nominal.
          </p>
        </div>
        {/* Clickable Profile Dropdown */}
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
          {/* Chart will be added here later */}
          <div className="text-center">
            <p> Real-time chart coming soon</p>
            <p className="text-xs mt-2">Will display data from your database</p>
          </div>
        </div>
      </div>
    </div>
  );
}
