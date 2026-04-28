"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "alhana.theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyDomTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    setThemeState(saved);
  }, []);

  React.useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyDomTheme(resolved);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  React.useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyDomTheme(resolved);
    };
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((t: ThemeMode) => setThemeState(t), []);
  const toggle = React.useCallback(() => {
    setThemeState((prev) => (resolveTheme(prev) === "dark" ? "light" : "dark"));
  }, []);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

