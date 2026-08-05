"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import api from "@/lib/api";
import { Plus, Loader2, Trash2 } from "lucide-react";

interface StaffMember {
  id: number;
  full_name: string;
  email: string;
  department: string;
  role: string;
  phone?: string;
}

interface FormData {
  full_name: string;
  email: string;
  department: string;
  role: string;
  phone: string;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    department: "General",
    role: "staff",
    phone: "",
  });

  // Clean, standard data fetching without complex useCallback dependency issues
  useEffect(() => {
    let isMounted = true;

    const loadStaff = async () => {
      try {
        const response = await api.get("/staff/");
        if (isMounted) {
          setStaffList(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadStaff();

    return () => {
      isMounted = false;
    };
  }, []);

  // TypeScript-safe input change handler
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof FormData]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/staff/", formData);
      setShowForm(false);
      setFormData({
        full_name: "",
        email: "",
        department: "General",
        role: "staff",
        phone: "",
      });

      // Refresh list after successful addition
      const response = await api.get("/staff/");
      setStaffList(response.data);
    } catch (error) {
      // Clean Axios error handling
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Failed to add staff member");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Staff Directory
          </h1>
          <p className="text-gray-400">Manage hospital personnel and roles.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Staff
        </button>
      </div>

      {/* Add Staff Form (Collapsible) */}
      {showForm && (
        <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface mb-8 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-4">
            Add New Staff Member
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Full Name
              </label>
              <input
                required
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="john@hospital.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="General">General</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgery">Surgery</option>
                <option value="Nursing">Nursing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="staff">Staff</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Phone (Optional)
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Staff Member"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-white/10 hover:bg-white/5 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table (Mobile Responsive) */}
      <div className="glass-panel rounded-xl border border-white/10 bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-background text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No staff members found. Add one above!
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {staff.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs border border-purple-500/20">
                        {staff.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize">{staff.role}</td>
                    <td className="px-6 py-4 text-gray-400">{staff.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
