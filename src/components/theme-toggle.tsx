"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Dark mode is external state (a DOM attribute + localStorage), not
 * something React owns — `useSyncExternalStore` is the correct primitive
 * for reading it: `getServerSnapshot` supplies the safe default (light)
 * during SSR, so the server-rendered HTML and the client's first render
 * always agree and there is no hydration mismatch, while `getSnapshot`
 * reads the real, possibly-persisted value once running in the browser.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function getServerSnapshot() {
  return false;
}

function setDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    // localStorage unavailable (private browsing, disabled storage, etc.)
    // — the toggle still applies to the current page view, it just won't
    // persist across visits.
  }
  listeners.forEach((listener) => listener());
}

/** Compact light/dark toggle for the site header. A fresh visit always starts light unless a prior choice was saved (see layout.tsx's inline no-flash script). */
export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setDarkMode(!isDark)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-7 w-7 shrink-0 items-center justify-center border border-border text-foreground-secondary transition-colors duration-150 hover:border-foreground-secondary hover:text-foreground"
    >
      {isDark ? <Moon aria-hidden className="h-3.5 w-3.5" /> : <Sun aria-hidden className="h-3.5 w-3.5" />}
    </button>
  );
}
