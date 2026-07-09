import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { X } from "lucide-react";

export const FocusLayout: React.FC = () => {
  const { setSidebarCollapsed } = useUIStore();

  // Automatically collapse sidebar on mount, restore on unmount
  useEffect(() => {
    setSidebarCollapsed(true);
    return () => {
      setSidebarCollapsed(false);
    };
  }, [setSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background text-on-background relative flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background Breathing Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary-container/10 blur-[120px] pointer-events-none animate-timer-breath" />

      {/* Grain shader overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none" />

      {/* Floating Exit Trigger */}
      <header className="absolute top-8 right-8 z-50">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-surface-container-high/60 backdrop-blur border border-white/5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-300 shadow-lg"
        >
          <X size={16} />
          <span className="text-[12px] uppercase font-bold tracking-wider">Exit Focus</span>
        </Link>
      </header>

      {/* Active Focus Display Page */}
      <main className="w-full max-w-4xl relative z-10 px-6 py-12 flex flex-col items-center">
        <Outlet />
      </main>
    </div>
  );
};
