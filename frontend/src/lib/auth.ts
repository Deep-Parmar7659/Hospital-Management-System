export interface UserPayload {
  sub: string; // email
  role: string; // admin, hr, staff
  exp: number; // expiration time
}

export const getUserFromToken = (): UserPayload | null => {
  // Prevent server-side crash
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("nexus_token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const getUserRole = (): string => {
  // Prevent server-side crash
  if (typeof window === "undefined") return "staff";

  const payload = getUserFromToken();
  return payload?.role || "staff";
};

export const hasPermission = (allowedRoles: string[]): boolean => {
  const userRole = getUserRole();
  return allowedRoles.includes(userRole);
};
