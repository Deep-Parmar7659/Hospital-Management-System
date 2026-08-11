import axios from "axios";

type StaffSummary = {
  id: number;
  email: string;
  full_name: string;
};

// Base URL for your FastAPI backend - reads from Vercel environment variable
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexus_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.access_token) {
        localStorage.setItem("nexus_token", response.data.access_token);

        // Decode JWT
        const token = response.data.access_token;
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const payload = JSON.parse(jsonPayload);

        console.log("🔍 Decoded JWT payload:", payload);
        console.log("🔍 Looking for staff with email:", email);

        // Fetch staff list
        let foundStaffId = 1;
        let foundStaffName = "Unknown";
        try {
          const staffResponse = await api.get<StaffSummary[]>("/staff/");
          const staffList = staffResponse.data;
          console.log("📋 Total staff members found:", staffList.length);
          console.log("📋 Staff list:", staffList);

          // Try to find matching staff (case-insensitive)
          const matchedStaff = staffList.find((s: StaffSummary) => {
            const match = s.email.toLowerCase() === email.toLowerCase();
            console.log(`Checking ${s.email} === ${email}? ${match}`);
            return match;
          });

          if (matchedStaff) {
            foundStaffId = matchedStaff.id;
            foundStaffName = matchedStaff.full_name;
            console.log(
              "✅ MATCH FOUND! staff_id:",
              foundStaffId,
              "name:",
              foundStaffName,
            );
          } else {
            console.warn("❌ NO MATCH FOUND for email:", email);
            console.warn(
              "Available emails:",
              staffList.map((s: StaffSummary) => s.email),
            );
          }
        } catch (err) {
          console.error("❌ Failed to fetch staff list:", err);
        }

        // Save user data
        const userData = {
          email: payload.sub || email,
          role: payload.role || "staff",
          full_name: payload.full_name || foundStaffName || email.split("@")[0],
          staff_id: foundStaffId,
        };

        localStorage.setItem("nexus_user", JSON.stringify(userData));
        console.log("💾 Saved to localStorage:", userData);
        alert(
          `Login successful!\nStaff ID: ${foundStaffId}\nName: ${foundStaffName}`,
        );
      }
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  register: async (data: unknown) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      console.error("Register API call failed:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("nexus_token");
  },

  getUser: () => {
    const user = localStorage.getItem("nexus_user");
    return user ? JSON.parse(user) : null;
  },
};

export default api;
