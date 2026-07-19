import { create } from "zustand";
import { getToken, deleteToken, saveToken } from "../utils/secureStore";
import axios from "axios";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_merchant_profile: boolean;
  created_at?: string;
  updated_at?: string;
};

type Mode = "dolan" | "bakul";

type AppState = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  isLoadingAuth: boolean;
  
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, full_name: string, password: string) => Promise<void>;
};

export const useAppStore = create<AppState>((set) => ({
  mode: "dolan",
  setMode: (mode) => set({ mode }),
  
  user: null,
  setUser: (user) => set({ user }),
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  isLoadingAuth: true,
  
  logout: async () => {
    try {
      const refreshToken = await getToken("refresh_token");
      if (refreshToken) {
        const accessToken = await getToken("access_token");
        await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/auth/logout`,
          { refresh_token: refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (error) {
      console.error("Logout API Error:", error);
    } finally {
      await deleteToken("access_token");
      await deleteToken("refresh_token");
      await deleteToken("user_data");
      set({ user: null, isLoggedIn: false });
    }
  },
  
  restoreSession: async () => {
    try {
      const token = await getToken("access_token");
      if (token) {
        const userStr = await getToken("user_data");
        if (userStr) {
          set({ user: JSON.parse(userStr), isLoggedIn: true });
        } else {
          set({ isLoggedIn: true });
        }
      } else {
        set({ isLoggedIn: false, user: null });
      }
    } catch (e) {
      set({ isLoggedIn: false, user: null });
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/auth/login`, {
        email,
        password,
      });
      await saveToken("access_token", data.access_token);
      await saveToken("refresh_token", data.refresh_token);
      await saveToken("user_data", JSON.stringify(data.user));
      set({ user: data.user, isLoggedIn: true });
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },

  register: async (email, full_name, password) => {
    try {
      const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/auth/register`, {
        email,
        full_name,
        password,
      });
      await saveToken("access_token", data.access_token);
      await saveToken("refresh_token", data.refresh_token);
      await saveToken("user_data", JSON.stringify(data.user));
      set({ user: data.user, isLoggedIn: true });
    } catch (error) {
      console.error("Register API Error:", error);
      throw error;
    }
  },
}));
