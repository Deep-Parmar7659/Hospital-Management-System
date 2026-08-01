import Link from "next/link";
import { Activity, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2" />

      <div className="glass-panel w-full max-w-md p-8 relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Activity className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            NEXUS <span className="text-primary">HMS</span>
          </h1>
        </div>

        <p className="text-gray-400 mb-10 text-lg">
          Next-Generation Hospital Management System. <br />
          Secure. Fast. Reliable.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="neon-button w-full flex items-center justify-center gap-3 py-4 text-lg font-semibold"
          >
            <LogIn className="w-5 h-5" />
            Login to Dashboard
          </Link>

          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-3 py-4 text-lg font-semibold rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Create New Account
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          © 2026 Nexus HMS. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
