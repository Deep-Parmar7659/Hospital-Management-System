"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

interface WeeklyMetric {
  day: string;
  admissions: number;
  discharges: number;
}

interface DepartmentStaff {
  name: string;
  staff: number;
}

interface LeaveDistribution {
  name: string;
  value: number;
  color: string;
}

type ChartTooltipItem = {
  color?: string;
  name?: string;
  value?: number | string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((item, index: number) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts() {
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetric[]>([]);
  const [departmentStaff, setDepartmentStaff] = useState<DepartmentStaff[]>([]);
  const [leaveDistribution, setLeaveDistribution] = useState<
    LeaveDistribution[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all chart data in parallel
        const [weeklyRes, deptRes, leaveRes] = await Promise.all([
          api.get("/dashboard/weekly-metrics"),
          api.get("/dashboard/staff-by-department"),
          api.get("/dashboard/leave-distribution"),
        ]);

        setWeeklyMetrics(weeklyRes.data);
        setDepartmentStaff(deptRes.data);
        setLeaveDistribution(leaveRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-12 rounded-xl border border-white/10 bg-surface flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-4" />
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Metrics Area Chart */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Hospital Metrics (Weekly)
          </h2>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-gray-400">Admissions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <span className="text-gray-400">Discharges</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          {weeklyMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyMetrics}>
                <defs>
                  <linearGradient
                    id="colorAdmissions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorDischarges"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="admissions"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAdmissions)"
                />
                <Area
                  type="monotone"
                  dataKey="discharges"
                  stroke="#c084fc"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDischarges)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Department Staff & Leave Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Staff Bar Chart */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface">
          <h2 className="text-xl font-bold text-white mb-6">
            Staff by Department
          </h2>
          <div className="h-64">
            {departmentStaff.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStaff}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="staff" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No staff data available
              </div>
            )}
          </div>
        </div>

        {/* Leave Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface">
          <h2 className="text-xl font-bold text-white mb-6">
            Leave Status Distribution
          </h2>
          <div className="h-64 flex items-center justify-center">
            {leaveDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No leave data available
              </div>
            )}
          </div>
          {leaveDistribution.length > 0 && (
            <div className="flex justify-center gap-4 mt-4 text-xs">
              {leaveDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
