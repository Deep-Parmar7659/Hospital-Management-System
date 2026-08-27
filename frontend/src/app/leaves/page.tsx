"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { authService } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import {
  CalendarDays,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";

interface LeaveRequest {
  id: number;
  staff_id: number;
  staff_name: string;
  staff_department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Rejected: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function LeavesPage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStoredUser = () => {
    if (typeof window === "undefined") return null;

    const storedUser = window.localStorage.getItem("nexus_user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (e) {
      console.error("Error parsing user:", e);
      return null;
    }
  };

  const storedUser = getStoredUser();

  // Initialize from the stored user once; no extra effect synchronization needed.
  const [userRole] = useState(storedUser?.role || "staff");
  const [currentStaffId] = useState<number>(storedUser?.staff_id || 1);

  // Form state
  const [formData, setFormData] = useState({
    staff_id: storedUser?.staff_id || 1,
    leave_type: "Casual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    fetchLeaves();
  }, [router]);

  async function fetchLeaves() {
    try {
      const res = await api.get("/leaves/");
      setLeaves(res.data);
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getErrorMessage = (error: unknown, defaultMsg: string) => {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      return axiosError.response?.data?.detail || defaultMsg;
    }
    return defaultMsg;
  };

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent admins/HR from requesting leaves
    if (!currentStaffId || userRole === "admin" || userRole === "hr") {
      alert("Only regular staff members can request leaves");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/leaves/", {
        ...formData,
        staff_id: currentStaffId, // ✅ Ensure we send the real staff_id from the token
      });
      setShowModal(false);
      fetchLeaves();
      setFormData({
        staff_id: currentStaffId,
        leave_type: "Casual",
        start_date: "",
        end_date: "",
        reason: "",
      });
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to request leave"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (leaveId: number, newStatus: string) => {
    try {
      // Get the current user's role from localStorage
      const storedUser = localStorage.getItem("nexus_user");
      const userRole = storedUser ? JSON.parse(storedUser).role : "staff";

      await api.patch(`/leaves/${leaveId}/status`, {
        status: newStatus,
        updated_by_role: userRole,
      });
      fetchLeaves();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update status"));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CalendarDays className="text-cyan-400" /> Leave Management
            </h1>
            <p className="text-gray-400 mt-1">
              Track and approve staff time-off requests.
            </p>
          </div>

          {userRole !== "admin" && userRole !== "hr" && currentStaffId && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Request Leave
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Approvals</p>
              <p className="text-2xl font-bold text-white">
                {leaves.filter((l) => l.status === "Pending").length}
              </p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Approved Leaves</p>
              <p className="text-2xl font-bold text-white">
                {leaves.filter((l) => l.status === "Approved").length}
              </p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rejected Leaves</p>
              <p className="text-2xl font-bold text-white">
                {leaves.filter((l) => l.status === "Rejected").length}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-xl border border-white/10 bg-surface overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
              <p>Loading leave requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background text-gray-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Staff</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {leaves.length > 0 ? (
                      leaves.map((leave) => (
                        <motion.tr
                          key={leave.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-white">
                                {leave.staff_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {leave.staff_department}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">
                            {leave.leave_type}
                          </td>
                          <td className="p-4 text-gray-300 text-sm">
                            {formatDate(leave.start_date)} <br />
                            <span className="text-gray-500">
                              to {formatDate(leave.end_date)}
                            </span>
                          </td>
                          <td
                            className="p-4 text-gray-300 text-sm max-w-xs truncate"
                            title={leave.reason}
                          >
                            {leave.reason}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${statusColors[leave.status]}`}
                            >
                              {leave.status === "Pending" && (
                                <Clock className="w-3 h-3" />
                              )}
                              {leave.status === "Approved" && (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {leave.status === "Rejected" && (
                                <XCircle className="w-3 h-3" />
                              )}
                              {leave.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {/* Only show approve/reject buttons to Admin or HR */}
                            {leave.status === "Pending" &&
                            (userRole === "admin" || userRole === "hr") ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(leave.id, "Approved")
                                  }
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(leave.id, "Rejected")
                                  }
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-xs">
                                Processed
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-gray-500"
                        >
                          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No leave requests found.</p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Leave Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-lg p-6 relative rounded-xl border border-white/10 bg-surface"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="text-cyan-400" /> Request Time Off
              </h2>

              <form onSubmit={handleRequestLeave} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Leave Type
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    value={formData.leave_type}
                    onChange={(e) =>
                      setFormData({ ...formData, leave_type: e.target.value })
                    }
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Start Date
                    </label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      End Date
                    </label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Briefly explain the reason for your leave..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
