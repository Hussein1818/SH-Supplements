import { create } from "zustand";
import { api } from "../auth/axiosInstance";

const BASE_URL = "https://sh-supplements.runasp.net/api";

export const ROLES = {
  ADMIN: "Admin",
  TRAINER: "Trainer",
  MODERATOR: "Moderator",
  SUPPORT: "Support",
  CONTENT_MANAGER: "Content Manager",
} as const;

// Helper to extract role claims from JWT when API response roles are omitted
function extractRolesFromToken(token: string | null): string[] {
  if (!token) return [];
  try {
    const parts = token.split(".");
    if (parts.length < 2) return [];
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    const roleClaim =
      payload.roles ||
      payload.role ||
      payload.Role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!roleClaim) return [];
    if (Array.isArray(roleClaim)) return roleClaim.map(String);
    if (typeof roleClaim === "string") return [roleClaim];
    return [];
  } catch (e) {
    return [];
  }
}

// types
interface AuthState {
  accessToken: string | null;
  roles: string[];
  isLoading: boolean;

  login: (token: string, roles?: string[]) => void;
  logout: () => void;
  checkRefresh: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

// store creation
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  roles: [],
  isLoading: true,

  login: (token, roles) => {
    // Primary source: response.data.roles. Fallback: extract from JWT
    const finalRoles =
      roles && Array.isArray(roles) && roles.length > 0
        ? roles
        : extractRolesFromToken(token);
    set({ accessToken: token, roles: finalRoles });
  },

  logout: () => set({ accessToken: null, roles: [] }),

  checkRefresh: async () => {
    try {
      const response = await api.post(
        `${BASE_URL}/Auth/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      );
      const token = response.data?.token || response.data?.accessToken || null;
      const roles = response.data?.roles;
      const finalRoles =
        roles && Array.isArray(roles) && roles.length > 0
          ? roles
          : extractRolesFromToken(token);
      set({ accessToken: token, roles: finalRoles, isLoading: false });
    } catch (error) {
      set({ accessToken: null, roles: [], isLoading: false });
    }
  },

  isAdmin: () => {
    const state = get();
    return state.roles.some(
      (r) =>
        r.toLowerCase() === ROLES.ADMIN.toLowerCase() ||
        r.toLowerCase() === "administrator"
    );
  },

  hasRole: (role: string) => {
    const state = get();
    return state.roles.some((r) => r.toLowerCase() === role.toLowerCase());
  },
}));

export const isAdmin = () => useAuthStore.getState().isAdmin();
export const hasRole = (role: string) => useAuthStore.getState().hasRole(role);
