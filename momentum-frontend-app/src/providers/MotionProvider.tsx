import React, { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

const ReducedMotionContext = createContext<boolean>(false);

export const useReducedMotion = () => useContext(ReducedMotionContext);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <ReducedMotionContext.Provider value={shouldReduceMotion}>
      <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
        {children}
      </MotionConfig>
    </ReducedMotionContext.Provider>
  );
};
