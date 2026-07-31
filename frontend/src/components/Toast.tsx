"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastData = {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

interface ToastProps {
  toasts: ToastData[];
  removeToast: (id: number) => void;
}

const icons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  error: <AlertTriangle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-primary" />,
};

const borders: Record<string, string> = {
  success: "border-emerald-400/30",
  error: "border-red-400/30",
  info: "border-primary/30",
};

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`pointer-events-auto glass-panel p-4 w-80 border-l-4 ${borders[toast.type]} shadow-2xl flex items-start gap-3`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-sm">{toast.title}</h4>
              <p className="text-gray-400 text-xs mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
