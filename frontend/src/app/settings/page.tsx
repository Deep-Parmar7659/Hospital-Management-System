"use client";

import { useState } from "react";
import {
  Building2,
  Bell,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const defaultSettings = {
  hospital_name: "Nexus Hospital",
  hospital_address: "",
  contact_email: "",
  contact_phone: "",
  dark_mode: true,
  email_notifications: true,
  sms_notifications: false,
  auto_approve_leaves: false,
  max_leave_days: 30,
};

type Settings = typeof defaultSettings;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") {
      return defaultSettings;
    }

    try {
      const savedSettings = window.localStorage.getItem("nexus_settings");
      return savedSettings
        ? { ...defaultSettings, ...JSON.parse(savedSettings) }
        : defaultSettings;
    } catch (error) {
      console.error("Failed to load settings:", error);
      return defaultSettings;
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage (later connect to backend API)
      localStorage.setItem("nexus_settings", JSON.stringify(settings));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-gray-400">
          Manage your hospital system configuration
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <span className="text-green-400">{successMessage}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">General Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Hospital Name
            </label>
            <input
              type="text"
              value={settings.hospital_name}
              onChange={(e) => handleChange("hospital_name", e.target.value)}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">
              Hospital Address
            </label>
            <textarea
              value={settings.hospital_address}
              onChange={(e) => handleChange("hospital_address", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={settings.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">
                Receive notifications via email
              </p>
            </div>
            <button
              onClick={() =>
                handleChange(
                  "email_notifications",
                  !settings.email_notifications,
                )
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.email_notifications ? "bg-cyan-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  settings.email_notifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <p className="text-white font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-400">
                Receive notifications via SMS
              </p>
            </div>
            <button
              onClick={() =>
                handleChange("sms_notifications", !settings.sms_notifications)
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.sms_notifications ? "bg-cyan-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  settings.sms_notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Leave Settings */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Leave Management</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Maximum Leave Days Per Year
            </label>
            <input
              type="number"
              value={settings.max_leave_days}
              onChange={(e) =>
                handleChange("max_leave_days", parseInt(e.target.value))
              }
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <p className="text-white font-medium">Auto-approve Leaves</p>
              <p className="text-sm text-gray-400">
                Automatically approve leave requests
              </p>
            </div>
            <button
              onClick={() =>
                handleChange(
                  "auto_approve_leaves",
                  !settings.auto_approve_leaves,
                )
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.auto_approve_leaves ? "bg-cyan-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  settings.auto_approve_leaves
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
