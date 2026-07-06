import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthEndpoint =
      url.includes("/Auth/login") || url.includes("/Auth/refresh-token");

    if (error.response && !isAuthEndpoint) {
      const status = error.response.status;
      if (status === 401) {
        useAuthStore.getState().logout();
        toast.error("Your session has expired. Please sign in again.");
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      } else if (status === 403) {
        useAuthStore.getState().logout();
        toast.error("You no longer have permission to access this resource.");
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
