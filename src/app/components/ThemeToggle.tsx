"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const THEME_KEY = "command-center-theme";
const THEME_EVENT = "command-center-theme-change";

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeTheme(listener: () => void): () => void {
  const onStorageChange = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;
    document.documentElement.classList.toggle("dark", event.newValue === "dark");
    listener();
  };
  window.addEventListener("storage", onStorageChange);
  window.addEventListener(THEME_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorageChange);
    window.removeEventListener(THEME_EVENT, listener);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // The current page theme still changes if browser storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const nextThemeLabel = theme === "light" ? "dark" : "light";
  const Icon = theme === "light" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
