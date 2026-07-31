"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import api, { authService } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

interface AttendanceRecord {
  staff_id: number;
  staff_name: string;
  staff_email: string;
  staff_department: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  is_checked_in: boolean;
}

interface CurrentUserAttendance {
  id: number;
  check_in: string | null;
  check_out: string | null;
  status: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>(
    [],
  );
  const [currentUserAttendance, setCurrentUserAttendance] =
    useState<CurrentUserAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const currentUserId = 1;
  const fetchAttendanceData = useCallback(async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get<AttendanceRecord[]>("/attendance/today"),
        api.get<AttendanceRecord[]>("/attendance/history"),
      ]);

      setTodayAttendance(todayRes.data);

      const userRecord = historyRes.data.find(
        (r) => r.staff_id === currentUserId,
      );
      setCurrentUserAttendance(
        userRecord
          ? {
              id: userRecord.staff_id,
              check_in: userRecord.check_in,
              check_out: userRecord.check_out,
              status: userRecord.status,
            }
          : null,
      );
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    const initializeAttendance = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login");
      } else {
        await fetchAttendanceData();
      }
    };
    initializeAttendance();
  }, [router, fetchAttendanceData]);

  const handleCheckIn = async () => {
    setIsActionLoading(true);
    try {
      await api.post("/attendance/check-in", { staff_id: currentUserId });
      await fetchAttendanceData();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      alert(axiosError.response?.data?.detail || "Check-in failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsActionLoading(true);
    try {
      await api.post("/attendance/check-out", { staff_id: currentUserId });
      await fetchAttendanceData();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      alert(axiosError.response?.data?.detail || "Check-out failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    totalPresent: todayAttendance.filter((a) => a.is_checked_in).length,
    totalCheckedOut: todayAttendance.filter((a) => a.check_out).length,
    onLeave: todayAttendance.filter((a) => a.status === "On Leave").length,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Clock className="text-primary" /> Attendance & Shift Tracking
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time staff presence monitoring
          </p>
        </div>

        {/* Quick Actions Card */}
        <div className="glass-panel p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-2xl font-bold text-black">SC</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Dr. Sarah Connor
                </h2>
                <p className="text-gray-400">Emergency Department</p>
                {currentUserAttendance?.check_in && (
                  <p className="text-sm text-primary mt-1">
                    Checked in at {formatTime(currentUserAttendance.check_in)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              {!currentUserAttendance?.check_in ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckIn}
                  disabled={isActionLoading}
                  className="neon-button flex items-center gap-2 px-8 py-4 text-lg"
                >
                  {isActionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Check In
                </motion.button>
              ) : !currentUserAttendance?.check_out ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckOut}
                  disabled={isActionLoading}
                  className="bg-accent/10 border border-accent/50 text-accent hover:bg-accent hover:text-black transition-all duration-300 flex items-center gap-2 px-8 py-4 text-lg rounded-lg"
                >
                  {isActionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Check Out
                </motion.button>
              ) : (
                <div className="glass-panel px-6 py-4 flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Day Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-400/10">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <h3 className="text-gray-400 text-sm">Currently On Duty</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {stats.totalPresent - stats.totalCheckedOut}
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <h3 className="text-gray-400 text-sm">Total Checked In</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {stats.totalPresent}
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <span className="text-xs text-gray-500">This Week</span>
            </div>
            <h3 className="text-gray-400 text-sm">Avg. Attendance</h3>
            <p className="text-3xl font-bold text-white mt-1">94%</p>
          </div>
        </div>

        {/* Today&apos;s Attendance Table */}
        <div className="glass-panel overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Today&apos;s Attendance
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p>Loading attendance records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Check In</th>
                    <th className="p-4">Check Out</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {todayAttendance.length > 0 ? (
                    todayAttendance.map((record, index) => (
                      <motion.tr
                        key={record.staff_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-black">
                              {record.staff_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {record.staff_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {record.staff_email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">
                          {record.staff_department}
                        </td>
                        <td className="p-4 text-gray-300 font-mono">
                          {formatTime(record.check_in)}
                        </td>
                        <td className="p-4 text-gray-300 font-mono">
                          {formatTime(record.check_out)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {record.is_checked_in ? (
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                              </span>
                            ) : null}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                record.status === "Present"
                                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                                  : record.status === "Late"
                                    ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                                    : record.status === "On Leave"
                                      ? "text-red-400 bg-red-400/10 border-red-400/20"
                                      : "text-gray-400 bg-gray-400/10 border-gray-400/20"
                              }`}
                            >
                              {record.status}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No attendance records for today yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
