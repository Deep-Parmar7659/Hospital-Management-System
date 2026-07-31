"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { getUserRole } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Activity,
  LogOut,
  Users,
  Bed,
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic";
import ToastContainer, { ToastData } from "@/components/Toast";
import NotificationCenter from "@/components/NotificationCenter";

const chartData = [
  { name: "Mon", patients: 40, staff: 24 },
  { name: "Tue", patients: 30, staff: 22 },
  { name: "Wed", patients: 55, staff: 28 },
  { name: "Thu", patients: 45, staff: 25 },
  { name: "Fri", patients: 60, staff: 30 },
  { name: "Sat", patients: 35, staff: 20 },
  { name: "Sun", patients: 25, staff: 18 },
];

const stats = [
  {
    title: "Active Beds",
    value: "142/200",
    icon: Bed,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "On-Duty Staff",
    value: "48",
    icon: Users,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    title: "ICU Status",
    value: "85% Full",
    icon: Activity,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    title: "Pending Leaves",
    value: "12",
    icon: FileText,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
];

const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false },
);
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});

// Define ALL possible nav items with their required roles
const allNavItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: TrendingUp,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Staff Directory",
    path: "/staff",
    icon: Users,
    roles: ["admin", "hr"],
  },
  {
    name: "Attendance",
    path: "/attendance",
    icon: Clock,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Leave Requests",
    path: "/leaves",
    icon: Calendar,
    roles: ["admin", "hr", "staff"],
  },
  {
    name: "Shift Schedule",
    path: "/shifts",
    icon: Calendar,
    roles: ["admin", "hr"],
  }, // ADD THIS
  {
    name: "Payroll",
    path: "/payroll",
    icon: DollarSign,
    roles: ["admin", "hr"],
  },
  { name: "Reports", path: "/reports", icon: Activity, roles: ["admin"] },
];

export default function DashboardPage() {
  const router = useRouter();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [userRole, setUserRole] = useState<string>("staff"); // Default fallback
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      const role = getUserRole();
      setUserRole(role);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  // Filter nav items based on the safely loaded userRole
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  // Show loading state while checking auth/role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">
            Initializing secure session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 glass-panel m-4 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <Activity className="text-primary w-8 h-8 animate-pulse-slow" />
          <span className="text-xl font-bold tracking-wider text-white">
            NEXUS
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                item.path === "/dashboard"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-accent/50 text-accent hover:bg-accent/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white dark:text-white">
              Welcome back, <span className="text-primary">Commander</span>
            </h1>
            <p className="text-gray-400 dark:text-gray-400 mt-1">
              System operational. All modules nominal.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationCenter />
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center font-bold text-black">
              SC
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                  Live
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-white dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white dark:text-white">
              Hospital Metrics (Weekly)
            </h2>
            <select className="glass-input text-sm py-1 px-3">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>

          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="staffFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stroke="#7c3aed"
                  fill="url(#patientsFill)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="staff"
                  stroke="#22d3ee"
                  fill="url(#staffFill)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ToastContainer
          toasts={toasts}
          removeToast={(id) =>
            setToasts((prev) => prev.filter((t) => t.id !== id))
          }
        />
      </main>
    </div>
  );
}
