"use client";

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

// Mock data - replace with real API data later
const weeklyMetrics = [
  { day: "Mon", admissions: 24, discharges: 20 },
  { day: "Tue", admissions: 28, discharges: 25 },
  { day: "Wed", admissions: 45, discharges: 38 },
  { day: "Thu", admissions: 32, discharges: 30 },
  { day: "Fri", admissions: 52, discharges: 45 },
  { day: "Sat", admissions: 38, discharges: 35 },
  { day: "Sun", admissions: 25, discharges: 22 },
];

const departmentStaff = [
  { name: "Surgery", staff: 12 },
  { name: "Cardiology", staff: 8 },
  { name: "Neurology", staff: 6 },
  { name: "Pediatrics", staff: 10 },
  { name: "Nursing", staff: 18 },
  { name: "General", staff: 15 },
];

const leaveDistribution = [
  { name: "Pending", value: 1, color: "#fbbf24" },
  { name: "Approved", value: 8, color: "#10b981" },
  { name: "Rejected", value: 2, color: "#ef4444" },
];

type TooltipEntry = {
  color?: string;
  name?: string;
  value?: string | number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) => {
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStaff}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="staff" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface">
          <h2 className="text-xl font-bold text-white mb-6">
            Leave Status Distribution
          </h2>
          <div className="h-64 flex items-center justify-center">
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
          </div>
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
        </div>
      </div>
    </div>
  );
}
