import React from "react";
import { motion } from "framer-motion";

interface TickerItem {
  id: number;
  text: string;
}

const mockTickerItems: TickerItem[] = [
  { id: 1, text: "Rohan started Spring Boot · 2m ago" },
  { id: 2, text: "Elena reached 10h streak · 5m ago" },
  { id: 3, text: "James joined Physics 101 Room" },
  { id: 4, text: "Sarah completed Daily Focus Goal" },
];

export const LiveActivityTicker: React.FC = () => {
  // Triple items to support seamless infinite loop
  const loopItems = [...mockTickerItems, ...mockTickerItems, ...mockTickerItems];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <div className="w-full overflow-hidden border-y border-white/5 py-4 my-12 bg-surface-container-low select-none">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex w-max animate-ticker"
      >
        <div className="flex gap-16 px-8 items-center">
          {loopItems.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              variants={itemVariants}
              className="flex items-center gap-3 shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse-ring" />
              <span className="text-body-sm font-stats-md text-on-surface-variant font-mono">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
