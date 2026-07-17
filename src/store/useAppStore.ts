import { create } from "zustand";

type Mode = "dolan" | "bakul";

type AppState = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  userName: string;
  setUserName: (name: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  mode: "dolan",
  setMode: (mode) => set({ mode }),
  userName: "",
  setUserName: (userName) => set({ userName }),
}));
