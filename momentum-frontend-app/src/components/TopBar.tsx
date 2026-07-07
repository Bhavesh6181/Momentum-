import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { useSearchStore } from "../store/searchStore";
import { useNotificationStore } from "../store/notificationStore";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { AnimatePresence } from "framer-motion";

interface TopBarProps {
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { openSearch } = useSearchStore();
  const { unreadCount } = useNotificationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  // Mapping paths to screen names if title is not passed
  const pathLabelMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/focus": "Focus Session",
    "/groups": "Study Groups",
    "/goals": "Goals & Challenges",
    "/leaderboard": "Leaderboard",
    "/analytics": "Analytics",
    "/profile": "Profile",
    "/notifications": "Notifications",
  };

  const activeLabel = title || pathLabelMap[location.pathname] || "Workspace";

  return (
    <header className="h-20 border-b border-white/10 flex items-center justify-between px-6 md:px-10 bg-background z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <h2 className="text-headline-md text-on-surface font-bold uppercase tracking-wider m-0">
          {activeLabel}
        </h2>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Search Trigger */}
        <button
          onClick={openSearch}
          aria-label="Open quick nav (⌘K)"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-white/5 text-on-surface-variant hover:border-white/10 hover:text-on-surface transition-all text-xs font-semibold shadow-sm focus:outline-none"
        >
          <Search size={14} />
          <span>Quick Nav</span>
          <kbd className="ml-2 text-[10px] font-mono opacity-50 bg-surface-container-highest px-1 py-0.5 rounded border border-white/5">⌘K</kbd>
        </button>

        {/* Small Screen Search Icon */}
        <button
          onClick={openSearch}
          aria-label="Open search"
          className="sm:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors focus:outline-none"
        >
          <Search size={18} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Notifications"
            className={`p-2 rounded-xl transition-colors focus:outline-none ${
              dropdownOpen
                ? "bg-primary-container/20 text-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-secondary-fixed-dim shadow-[0_0_8px_rgba(0,255,148,0.6)]" />
            )}
          </button>

          {/* Notifications Dropdown Popup */}
          <AnimatePresence>
            {dropdownOpen && (
              <NotificationsDropdown onClose={() => setDropdownOpen(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
