"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import api from "@/lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications/");
        if (isMounted) {
          setNotifications(res.data);
          setUnreadCount(
            res.data.filter((n: Notification) => !n.is_read).length,
          );
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 glass-panel hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full animate-pulse border-2 border-background" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-14 w-80 glass-panel z-50 overflow-hidden max-h-96 flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-white">Notifications</h3>
                <span className="text-xs text-primary">
                  {unreadCount} Unread
                </span>
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notif.is_read
                          ? "bg-transparent hover:bg-white/5"
                          : "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-white">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-gray-500">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No notifications yet.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
