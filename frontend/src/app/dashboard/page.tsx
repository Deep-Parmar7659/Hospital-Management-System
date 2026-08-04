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
  active_beds?: number;
  total_beds?: number;
  on_duty_staff?: number;
  icu_status?: string;
  pending_leaves?: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName] = useState(() => {
    if (typeof window === "undefined") return "User";

    try {
      const storedUser = localStorage.getItem("nexus_user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      return user?.full_name?.split(" ")[0] || "User";
    } catch {
      return "User";
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-cyan-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-cyan-400">{userName}</span>
          </h1>
          <p className="text-gray-400">
            System operational. All modules nominal.
          </p>
        </div>
        <ProfileDropdown />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-panel p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <span className="text-xs text-gray-400">Live</span>
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
      <div className="glass-panel p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-6">
          Hospital Metrics (Weekly)
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          {/* You can add Recharts here later */}
          <p>Chart coming soon with real data...</p>
        </div>
      </div>
    </div>
  );
}
