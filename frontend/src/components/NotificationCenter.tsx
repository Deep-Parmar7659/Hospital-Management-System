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
  const [userRole, setUserRole] = useState<string>("");
  const [staffId, setStaffId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      setMounted(true);

      let role = "";
      let id: number | null = null;

      try {
        const storedUser = localStorage.getItem("nexus_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          role = user.role || "staff";
          id = user.staff_id ?? null;
          console.log(
            "🔔 NotificationBell - Role:",
            user.role,
            "Staff ID:",
            user.staff_id,
          );
        }
      } catch (error) {
        console.error("Error parsing user:", error);
      }

      setUserRole(role);
      setStaffId(id);
    }, 0);

    return () => window.clearTimeout(mountTimer);
  }, []);

  // Fetch notifications based on role
  useEffect(() => {
    if (!mounted) return;

    const fetchNotifications = async () => {
      try {
        let endpoint = "";

        // ✅ Different endpoints for Admin vs Staff
        if (userRole === "admin" || userRole === "hr") {
          endpoint = "/notifications/admin";
          console.log("📡 Fetching admin notifications");
        } else if (staffId) {
          endpoint = `/notifications/staff/${staffId}`;
          console.log("📡 Fetching staff notifications for ID:", staffId);
        } else {
          console.log("️ No staffId or admin role - skipping notifications");
          return;
        }

        const res = await api.get(endpoint);
        console.log("✅ Received notifications:", res.data.length);
        const unread = res.data.filter((n: Notification) => !n.is_read);
        console.log("📬 Unread count:", unread.length);
        setNotifications(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [userRole, staffId, mounted]);

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

  const markAllAsRead = async () => {
    try {
      if (userRole === "admin" || userRole === "hr") {
        // For admin, mark all as read in the frontend only
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      } else if (staffId) {
        await api.patch(`/notifications/staff/${staffId}/read-all`);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!mounted) {
    return (
      <button className="relative p-2 text-gray-400">
        <Bell className="w-6 h-6" />
      </button>
    );
  }

  // Don't show bell if no role/staffId
  if (!userRole || (!staffId && userRole !== "admin" && userRole !== "hr")) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl border border-white/10 bg-surface shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
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
