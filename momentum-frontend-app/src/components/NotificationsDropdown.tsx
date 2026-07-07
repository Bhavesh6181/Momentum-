import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Bell, Trophy, Users, MessageSquare, Zap } from "lucide-react";
import { useNotificationStore, type NotificationItem } from "../store/notificationStore";

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
} as const;

const notifTypeIcons: Record<NotificationItem["type"], React.ReactNode> = {
  invite: <Users size={12} className="text-primary" />,
  achievement: <Trophy size={12} className="text-yellow-400" />,
  mention: <MessageSquare size={12} className="text-tertiary" />,
  streak: <Zap size={12} className="text-orange-400" />,
  group: <Bell size={12} className="text-secondary-fixed-dim" />,
};

function formatTimeAgo(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface DropdownProps {
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<DropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      ref={containerRef}
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-left"
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-surface-container-high/50">
        <div>
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Notifications</h4>
          {unreadCount > 0 && (
            <p className="text-[10px] text-primary font-semibold mt-0.5">{unreadCount} unread items</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 focus:outline-none"
          >
            <Check size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-white/5">
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-on-surface-variant">
            <Bell size={28} className="opacity-30 mb-2" />
            <p className="text-xs font-medium">All caught up!</p>
            <p className="text-[10px] opacity-60">No recent alerts</p>
          </div>
        ) : (
          recentNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`flex items-start gap-3 px-5 py-3.5 hover:bg-white/5 cursor-pointer transition-colors ${
                !notif.read ? "bg-primary-container/5" : ""
              }`}
            >
              {/* Type Icon */}
              <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                {notifTypeIcons[notif.type] || <Bell size={12} />}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <p className={`text-xs font-bold truncate ${!notif.read ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {notif.title}
                  </p>
                  <span className="text-[9px] text-on-surface-variant/60 shrink-0">{formatTimeAgo(notif.timestamp)}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {/* Unread indicator */}
              {!notif.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Dropdown Footer */}
      <Link
        to="/notifications"
        onClick={onClose}
        className="block text-center py-3 bg-surface-container-high/50 hover:bg-surface-container-high border-t border-white/5 text-[11px] font-bold text-primary hover:underline transition-all"
      >
        View all notifications
      </Link>
    </motion.div>
  );
};
