"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: () => void;
}

export default function AddStaffModal({
  isOpen,
  onClose,
  onStaffAdded,
}: AddStaffModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    department: "",
    designation: "",
    shift: "Morning",
    status: "Active",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/staff/", formData);
      onStaffAdded(); // Refresh the table
      onClose(); // Close modal
      // Reset form
      setFormData({
        full_name: "",
        email: "",
        department: "",
        designation: "",
        shift: "Morning",
        status: "Active",
      });
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Failed to add staff member.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-primary">+</span> Add New Staff Member
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-accent/10 border border-accent/50 rounded-lg text-accent text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Full Name
              </label>
              <input
                required
                type="text"
                className="glass-input w-full"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                required
                type="email"
                className="glass-input w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Department
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Cardiology"
                className="glass-input w-full"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Designation
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Senior Doctor"
                className="glass-input w-full"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Shift</label>
              <select
                className="glass-input w-full"
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value })
                }
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                className="glass-input w-full"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="neon-button w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Register Staff Member"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
