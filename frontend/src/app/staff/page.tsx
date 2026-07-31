"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import api from "@/lib/api";
import AddStaffModal from "@/components/AddStaffModal";
import {
  UserPlus,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

// Define the shape of our staff data
interface StaffMember {
  id: number;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  shift: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "On Leave": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Off Duty": "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function StaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        const response = await api.get("/staff/");
        setStaffList(response.data);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const fetchStaff = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.get("/staff/");
      setStaffList(response.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <UserPlus className="text-primary" /> Staff Directory
            </h1>
            <p className="text-gray-400 mt-1">
              Manage hospital personnel and on-duty status.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="neon-button flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Staff
          </button>
        </div>

        {/* Search Bar */}
        <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-panel overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p>Syncing with central database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Shift</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <tr
                        key={staff.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-black">
                              {staff.full_name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {staff.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {staff.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">
                          {staff.department}
                        </td>
                        <td className="p-4 text-gray-300">
                          {staff.designation}
                        </td>
                        <td className="p-4 text-gray-300 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />{" "}
                          {staff.shift}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${statusColors[staff.status] || statusColors["Off Duty"]}`}
                          >
                            {staff.status === "Active" && (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {staff.status === "On Leave" && (
                              <XCircle className="w-3 h-3" />
                            )}
                            {staff.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No staff members found. Add your first one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddStaffModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStaffAdded={fetchStaff}
      />
    </div>
  );
}
