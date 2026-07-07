import React, { useEffect } from "react";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Force dark mode globally
    document.documentElement.classList.add("dark");
    document.documentElement.style.backgroundColor = "var(--background)";
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return <>{children}</>;
};
