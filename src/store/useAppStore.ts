import { create } from "zustand";

type Mode = "dolan" | "bakul";

type AppState = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  userName: string;
  setUserName: (name: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  mode: "dolan",
  setMode: (mode) => set({ mode }),
  userName: "",
  setUserName: (userName) => set({ userName }),
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
}));
