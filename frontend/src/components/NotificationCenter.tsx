"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bell, X } from "lucide-react";

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [staffId, setStaffId] = useState<number | null>(null);

  // 1. Get staffId on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("nexus_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const nextStaffId = user?.staff_id ?? null;
          const timeoutId = window.setTimeout(() => {
            setStaffId(nextStaffId);
          }, 0);

          return () => window.clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);

  // 2. Fetch notifications and set up real-time polling
  useEffect(() => {
    if (!staffId) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/staff/${staffId}`);
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [staffId]);

  // 3. Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  // 4. Mark ALL notifications as read
  const markAllAsRead = async () => {
    if (!staffId) return;
    try {
      await api.patch(`/notifications/staff/${staffId}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => staffId && setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors ${
          staffId
            ? "text-gray-300 hover:text-white cursor-pointer"
            : "text-gray-600 cursor-not-allowed"
        }`}
        title={
          !staffId ? "No staff ID linked to this account" : "Notifications"
        }
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && staffId && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && staffId && (
        <>
          {/* Invisible backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl border border-white/10 bg-surface shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-semibold text-white text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-6 text-gray-400 text-sm text-center">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 border-b border-white/5 text-sm cursor-pointer transition-colors hover:bg-white/5 ${
                      n.is_read ? "text-gray-400" : "text-white bg-cyan-500/5"
                    }`}
                  >
                    <p className="leading-snug">{n.message}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(n.created_at).toLocaleDateString()}{" "}
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
