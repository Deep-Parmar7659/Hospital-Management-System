"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Activity, User, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Send only the fields the backend usually expects
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        // Remove 'role' for now unless your backend specifically asks for it
      };

      const response = await api.post("/auth/register", payload);
      console.log("Registration successful:", response.data);
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: { detail?: string } | string;
        };
        request?: unknown;
        message?: string;
      };

      console.log("FULL ERROR OBJECT:", err);
      console.log("ERROR RESPONSE:", apiError.response);
      console.log("ERROR MESSAGE:", apiError.message);

      let errorMsg = "Registration failed";
      if (apiError.response) {
        // Backend replied, but with an error (e.g., "Email already exists")
        const responseData = apiError.response.data;

        if (typeof responseData === "string") {
          errorMsg = responseData;
        } else if (responseData && typeof responseData === "object") {
          errorMsg =
            "detail" in responseData && typeof responseData.detail === "string"
              ? responseData.detail
              : JSON.stringify(responseData);
        }
      } else if (apiError.request) {
        // Request was sent, but NO response came back (CORS or Backend is asleep)
        errorMsg =
          "Network Error: Cannot reach backend. Is the Render backend awake?";
      } else {
        errorMsg = apiError.message || "Unknown error";
      }

      console.error("Final Error Message:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">
              NEXUS <span className="text-primary">HMS</span>
            </h1>
          </div>
          <p className="text-gray-400">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="text"
                required
                className="glass-input w-full pl-10"
                placeholder="Dr. John Doe"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                className="glass-input w-full pl-10"
                placeholder="doctor@hospital.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                className="glass-input w-full pl-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              className="glass-input w-full"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="neon-button w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
