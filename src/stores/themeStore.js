// themeStore.js
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "system",
  setTheme: (newTheme) => set({ theme: newTheme }),
}));
