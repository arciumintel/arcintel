"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface SpineContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
}

const SpineContext = createContext<SpineContextValue | null>(null);

const STORAGE_KEY = "arcademy.spine.collapsed";

/**
 * The "spine" is Arcademy's editorial sidebar. It can collapse to a thin
 * vertical strip (56px) to give the reading column more room. State is
 * persisted to localStorage so a reader's preferred mode survives page
 * navigation; first paint defaults to expanded.
 */
export function SpineProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR/CSR mismatch.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsedState(true);
    } catch {
      /* ignore */
    }
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <SpineContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SpineContext.Provider>
  );
}

export function useSpine() {
  const ctx = useContext(SpineContext);
  if (!ctx) {
    return { collapsed: false, toggle: () => {}, setCollapsed: () => {} } as SpineContextValue;
  }
  return ctx;
}
