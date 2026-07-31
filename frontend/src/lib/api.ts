import axios from "axios";

// Base URL for your FastAPI backend
const API_URL = process.env.NEXT_PUBLIC;

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
      }
      return response.data;
    } catch (error) {
      console.error("Login API call failed:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("nexus_token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("nexus_token");
  },
};

export default api;
