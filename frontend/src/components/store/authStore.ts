import { create } from "zustand";
import { api } from "../auth/axiosInstance";

const BASE_URL = "https://sh-supplements.runasp.net/api";

// types
interface AuthState {
  accessToken: string | null;
  isLoading: boolean;

  login: (token: string) => void;
  logout: () => void;
  checkRefresh: () => Promise<void>;
}

// store creation
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isLoading: true,

  login: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null }),

  checkRefresh: async () => {
    try {
      const response = await api.post(
        `${BASE_URL}/Auth/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      );
      set({ accessToken: response.data.token, isLoading: false });
    } catch (error) {
      set({ accessToken: null, isLoading: false });
    }
  },
}));
