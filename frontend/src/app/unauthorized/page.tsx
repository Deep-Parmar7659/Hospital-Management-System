"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-accent/10">
            <AlertTriangle className="w-12 h-12 text-accent" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">
          You do not have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="neon-button w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
}