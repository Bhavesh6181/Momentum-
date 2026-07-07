import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  type: "Focus" | "Collab" | "Perf";
  time?: string;
  isNew?: boolean;
}

const initialActivities: ActivityItem[] = [
  { id: "1", user: "Alex R.", action: "started \"Neural Networks\"", type: "Focus", time: "Just now" },
  { id: "2", user: "Sarah C.", action: "reached 4h streak", type: "Perf", time: "2m ago" },
  { id: "3", user: "James W.", action: "joined CS-402", type: "Collab", time: "5m ago" },
  { id: "4", user: "Maria G.", action: "completed \"AI Ethics\"", type: "Focus", time: "8m ago" },
  { id: "5", user: "Elena V.", action: "started \"Discrete Math\"", type: "Focus", time: "12m ago" },
  { id: "6", user: "Marcus K.", action: "earned \"Deep Diver\"", type: "Perf", time: "15m ago" },
];

const mockUsers = ["Rohan_S", "Elena_Z", "James_M", "Sarah_C", "Alex_V", "Priya_K", "Devin_99"];
const mockActions = [
  { action: "started \"Spring Boot\"", type: "Focus" },
  { action: "reached 10h streak", type: "Perf" },
  { action: "joined Physics 101 Room", type: "Collab" },
  { action: "completed Daily Focus Goal", type: "Perf" },
  { action: "started \"AI Algorithms\"", type: "Focus" },
];

export const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomAction = mockActions[Math.floor(Math.random() * mockActions.length)];
      
      const newActivity: ActivityItem = {
        id: Math.random().toString(36).substring(7),
        user: randomUser,
        action: randomAction.action,
        type: randomAction.type as any,
        time: "Just now",
        isNew: true,
      };

      setActivities((prev) => {
        const next = [newActivity, ...prev];
        return next.slice(0, 8);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="hidden lg:flex w-[45%] relative min-h-screen bg-[#070709] border-l border-white/5 overflow-hidden flex-col justify-between p-12 select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,92,231,0.03),transparent_70%)] pointer-events-none" />

      {/* Edge Gradient Overlays */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#070709] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-24 h-24 bg-gradient-to-t from-[#070709] to-transparent pointer-events-none z-10" />

      {/* Activity Feed Container */}
      <div className="relative flex-1 flex flex-col justify-start overflow-hidden pt-12">
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {activities.map((act) => (
              <motion.div
                key={act.id}
                initial={act.isNew ? { opacity: 0, y: -20, height: 0 } : { opacity: 1 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full text-left"
              >
                <motion.div
                  animate={
                    act.isNew
                      ? {
                          backgroundColor: ["rgba(5,231,119,0.2)", "rgba(19,19,24,1)"],
                          borderColor: ["rgba(5,231,119,0.4)", "rgba(255,255,255,0.08)"],
                        }
                      : {}
                  }
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="p-4 bg-surface border border-white/10 rounded-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                        <User className="text-on-surface-variant" size={14} />
                      </div>
                      <div className="flex flex-col text-left">
                        <p className="text-[13px] text-[#F5F5F7] font-semibold leading-tight m-0">
                          {act.user}{" "}
                          <span className="text-[#8B8B93] font-normal">{act.action}</span>
                        </p>
                        <p className="text-[10px] text-[#8B8B93] mt-1 uppercase tracking-wider m-0">
                          {act.time}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-primary border border-primary/20 px-2 py-1 rounded">
                      {act.type}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Network status overlay at bottom */}
      <div className="flex justify-between items-end relative z-10 pt-6 border-t border-white/5 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">
            Live Feed
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse-ring" />
            <span className="text-stats-md font-stats-md text-on-surface font-mono">
              2,481 Live Members
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            Latency
          </span>
          <span className="text-stats-md font-stats-md text-on-surface font-mono">
            14ms
          </span>
        </div>
      </div>
    </aside>
  );
};
