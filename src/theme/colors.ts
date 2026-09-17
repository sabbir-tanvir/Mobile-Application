export const colors = {
  primary: {
    DEFAULT: "#16a34a", // Vibrant Turf green
    light: "#4ade80",
    dark: "#14532d",
    foreground: "#ffffff",
  },
  secondary: {
    DEFAULT: "#0ea5e9", // Sky blue accent
    foreground: "#ffffff",
  },
  accent: {
    DEFAULT: "#f59e0b", // Amber for pending/warnings
    foreground: "#000000",
  },
  status: {
    pending: "#f59e0b",
    partial: "#3b82f6",
    paid: "#22c55e",
    cancelled: "#ef4444",
  },
  background: {
    DEFAULT: "#09090b", // Sleek dark mode background
    card: "#18181b",
    elevated: "#27272a",
    subtle: "#121214",
  },
  text: {
    DEFAULT: "#fafafa",
    muted: "#a1a1aa",
    subtle: "#71717a",
  },
  border: {
    DEFAULT: "#27272a",
    focus: "#22c55e",
  },
} as const;

export type Colors = typeof colors;
