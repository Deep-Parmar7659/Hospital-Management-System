"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Bell } from "lucide-react";

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [staffId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const storedUser = localStorage.getItem("nexus_user");
      if (!storedUser) return null;

      const user = JSON.parse(storedUser);
      return user?.staff_id ?? null;
    } catch {
      return null;
    }
  });

  const fetchNotifications = async (id: number) => {
    try {
      const res = await api.get(`/notifications/${id}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleToggleNotifications = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen && staffId) {
      await fetchNotifications(staffId);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!staffId) return null; // Don't show for admins without a staff_id

  return (
    <div className="relative">
      <button
        onClick={handleToggleNotifications}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl border border-white/10 bg-surface shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-white/10 font-semibold text-white">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-400 text-sm text-center">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-white/5 text-sm ${n.is_read ? "text-gray-400" : "text-white bg-white/5"}`}
              >
                {n.message}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
