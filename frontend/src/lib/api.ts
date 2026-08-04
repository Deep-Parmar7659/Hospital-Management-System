import axios from "axios";

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

        // Decode JWT to get user info
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

        // Save user data to localStorage
        const userData = {
          email: payload.sub || email,
          role: payload.role || "staff",
          full_name: payload.sub?.split("@")[0] || email.split("@")[0],
        };
        localStorage.setItem("nexus_user", JSON.stringify(userData));

        console.log("User data saved:", userData);
      }
      return response.data;
    } catch (error) {
      console.error("Login API call failed:", error);
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
