import { create } from "zustand";
import { Appearance, Platform } from "react-native";
import { colorScheme } from "nativewind";
import { storage } from "@/lib/storage";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemePreference;
  isDark: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = "turfslot_theme_preference";

function resolveIsDark(preference: ThemePreference): boolean {
  if (preference === "system") {
    return Appearance.getColorScheme() === "dark";
  }
  return preference === "dark";
}

function syncWebDarkMode(isDark: boolean) {
  if (Platform.OS === "web" && typeof document !== "undefined" && document.documentElement) {
    document.documentElement.style.setProperty("--css-interop-darkMode", "class dark");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark", // default to sleek sports venue dark mode
  isDark: true,

  setTheme: async (theme: ThemePreference) => {
    const isDark = resolveIsDark(theme);

    // Sync HTML class on Web
    syncWebDarkMode(isDark);

    // Safely update NativeWind colorScheme
    try {
      colorScheme.set(theme);
    } catch {
      // Gracefully fallback on web if nativewind flag hasn't synced
      try {
        colorScheme.set(isDark ? "dark" : "light");
      } catch {
        // Safe no-op
      }
    }

    await storage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme, isDark });
  },

  toggleTheme: async () => {
    const current = get().theme;
    const next: ThemePreference = current === "dark" ? "light" : "dark";
    await get().setTheme(next);
  },

  initializeTheme: async () => {
    try {
      const stored = await storage.getItem(THEME_STORAGE_KEY);
      const preference: ThemePreference =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "dark";

      const isDark = resolveIsDark(preference);

      // Sync HTML class on Web
      syncWebDarkMode(isDark);

      // Safely set NativeWind colorScheme
      try {
        colorScheme.set(preference);
      } catch {
        try {
          colorScheme.set(isDark ? "dark" : "light");
        } catch {
          // Safe no-op
        }
      }

      set({ theme: preference, isDark });

      // Listen to OS appearance changes when preference is "system"
      Appearance.addChangeListener(({ colorScheme: osScheme }) => {
        if (get().theme === "system") {
          const dark = osScheme === "dark";
          syncWebDarkMode(dark);
          try {
            colorScheme.set("system");
          } catch {}
          set({ isDark: dark });
        }
      });
    } catch {
      syncWebDarkMode(true);
      set({ theme: "dark", isDark: true });
    }
  },
}));
