import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Users, Trophy, MessageSquare, Zap } from "lucide-react";
import { useNotificationStore, type NotificationItem } from "../../store/notificationStore";

const typeConfig: Record<NotificationItem["type"], { icon: React.ReactNode; color: string }> = {
  invite: { icon: <Users size={16} />, color: "text-primary bg-primary-container/20 border-primary/20" },
  achievement: { icon: <Trophy size={16} />, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  mention: { icon: <MessageSquare size={16} />, color: "text-tertiary bg-tertiary/10 border-tertiary/20" },
  streak: { icon: <Zap size={16} />, color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  group: { icon: <Bell size={16} />, color: "text-secondary-fixed-dim bg-secondary-fixed-dim/10 border-secondary-fixed-dim/20" },
};

function formatTime(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotifItem({ notif, index }: { notif: NotificationItem; index: number }) {
  const config = typeConfig[notif.type] || typeConfig.group;
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => markAsRead(notif.id)}
      className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer text-left
        ${!notif.read ? "bg-primary-container/5 border border-primary/10" : "hover:bg-surface-container-high/30 border border-transparent"}`}
    >
      {/* Icon or Initials */}
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${config.color}`}>
        {notif.initials ? (
          <span className="text-xs font-bold">{notif.initials}</span>
        ) : (
          config.icon
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className={`text-sm font-semibold leading-snug ${!notif.read ? "text-on-surface" : "text-on-surface-variant"}`}>
            {notif.title}
          </p>
          <span className="text-[10px] text-on-surface-variant shrink-0">{formatTime(notif.timestamp)}</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notif.message}</p>
        {notif.type === "invite" && !notif.read && (
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold rounded-lg hover:brightness-110 transition-all">
              Accept
            </button>
            <button className="px-3 py-1 border border-white/10 text-on-surface-variant text-xs font-bold rounded-lg hover:border-white/20 transition-all">
              Decline
            </button>
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
      )}
    </motion.div>
  );
}

type Filter = "all" | "unread" | "mentions";

export function Notifications() {
  const [filter, setFilter] = useState<Filter>("all");
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read)
    : filter === "mentions" ? notifications.filter((n) => n.type === "mention")
    : notifications;

  return (
    <div className="pb-16 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight flex items-center gap-3">
            <Bell size={26} className="text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">Stay up to date with your academic circles.</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
        >
          <CheckCheck size={16} />
          Mark all read
        </button>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container-high rounded-xl w-fit mb-6">
        {(["all", "unread", "mentions"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize focus:outline-none
              ${filter === f ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            {filter === f && (
              <motion.div layoutId="notif-tab" className="absolute inset-0 bg-surface-container-highest rounded-lg"
                transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            )}
            <span className="relative z-10">
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-primary text-background text-[9px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell size={40} className="text-on-surface-variant/30 mb-4" />
          <p className="text-on-surface-variant font-medium">No notifications here</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((notif, i) => (
            <NotifItem key={notif.id} notif={notif} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
