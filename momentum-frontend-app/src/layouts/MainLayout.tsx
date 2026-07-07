import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { TopBar } from "../components/TopBar";
import { CommandPalette } from "../components/CommandPalette";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Timer,
  Users,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout: storeLogout } = useAuthStore();
  const { logout: apiLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/focus", label: "Focus Session", icon: Timer },
    { path: "/goals", label: "Goals & Challenges", icon: Zap },
    { path: "/groups", label: "Study Groups", icon: Users },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/profile", label: "Profile", icon: User },
  ];

  // Determine active label (partial match for nested routes)
  const activeLabel = navLinks.find((l) =>
    l.path === "/" ? location.pathname === "/" : location.pathname.startsWith(l.path)
  )?.label || "Workspace";

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("momentum_refresh_token") || "";
    try {
      await apiLogout(refreshToken);
    } catch (err) {
      console.error("Logout API failed, clearing local state anyway:", err);
      storeLogout();
    }
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 bg-surface border-r border-white/10 flex flex-col transition-all duration-300 z-50",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          {!sidebarCollapsed && (
            <span className="text-[18px] font-extrabold uppercase tracking-widest text-primary">
              Momentum
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface mx-auto"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-[14px]",
                  isActive
                    ? "bg-primary-container text-on-primary-container shadow-[0_4px_14px_rgba(108,92,231,0.25)] font-semibold"
                    : "text-on-surface/70 hover:bg-surface-container-high hover:text-on-surface hover:translate-x-0.5"
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-on-primary-container" : "text-on-surface/60 group-hover:text-on-surface"
                  )}
                />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User profile actions */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-9 w-9 rounded-full object-cover border border-primary/30"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1 text-left">
                <p className="text-body-sm font-semibold truncate leading-none text-on-surface">
                  {user.username}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-error hover:bg-error-container/10 transition-colors text-[14px]",
              sidebarCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarCollapsed ? "pl-20" : "pl-64"
        )}
      >
        {/* Top Navbar */}
        <TopBar />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Command Palette Search */}
      <CommandPalette />
    </div>
  );
};
