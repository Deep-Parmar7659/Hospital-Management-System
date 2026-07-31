"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { authService } from "@/lib/api";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Loader2,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  DollarSign,
} from "lucide-react";

const COLORS = ["#00f0ff", "#7000ff", "#ff003c", "#fbbf24", "#10b981"];

export default function ReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  type StaffByDeptEntry = { name: string; value: number };
  type PayrollByDeptEntry = { name: string; expenditure: number };
  type AttendanceTrendEntry = {
    month: string;
    present: number;
    absent: number;
  };
  type PerformanceMetric = { subject: string; A: number };

  type ReportsData = {
    staff_by_dept: StaffByDeptEntry[];
    payroll_by_dept: PayrollByDeptEntry[];
    attendance_trends: AttendanceTrendEntry[];
    performance_metrics: PerformanceMetric[];
  };

  const [data, setData] = useState<ReportsData | null>(null);

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports/dashboard-stats");
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
    } else {
      (async () => {
        await fetchReports();
      })();
    }
  }, [router]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-gray-400 animate-pulse">
            Compiling analytics matrix...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-primary" /> Reports & Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            High-level operational intelligence and metrics.
          </p>
        </div>

        {/* Top Row: Donut & Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Staff Distribution (Donut) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-white">
                Staff Distribution by Department
              </h2>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.staff_by_dept}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.staff_by_dept.map(
                      (entry: StaffByDeptEntry, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="rgba(0,0,0,0)"
                        />
                      ),
                    )}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#13131f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#9ca3af", paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Payroll Expenditure (Bar) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-bold text-white">
                Payroll Expenditure by Department
              </h2>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.payroll_by_dept}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#13131f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="expenditure"
                    fill="#7000ff"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: Line & Radar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Trends (Line) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                Attendance Trends (Last 6 Months)
              </h2>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.attendance_trends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#13131f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#9ca3af", paddingTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    stroke="#ff003c"
                    strokeWidth={3}
                    dot={{ fill: "#ff003c" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Hospital Performance (Radar) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-white">
                Performance Metrics
              </h2>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={data.performance_metrics}
                >
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 150]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#00f0ff"
                    fill="#00f0ff"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#13131f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
