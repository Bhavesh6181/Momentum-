import React from "react";
import { motion } from "framer-motion";
import { useWeeklyProgressQuery } from "../../../hooks/useDashboardData";
import { Skeleton } from "../../../components/ui/Skeleton";

export const WeeklyProgressChart: React.FC = () => {
  const { data: progress, isLoading } = useWeeklyProgressQuery();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface/50 p-8 h-[340px] flex flex-col justify-between text-left">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex items-end justify-between h-40 gap-3 pt-6">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <Skeleton className="w-full h-32 rounded-t-sm" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Find max hours to scale chart (default to 10 if all zero)
  const maxHours = progress ? Math.max(...progress.map((p) => p.hours), 10) : 10;

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const barVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    show: {
      scaleY: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-8 h-[340px] flex flex-col justify-between text-left relative overflow-hidden group weekly-chart-widget">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-container/2 via-transparent to-transparent pointer-events-none" />
      <div>
        <h3 className="text-headline-md font-bold text-on-surface">Weekly Intensity</h3>
        <p className="text-body-sm text-on-surface-variant/80 mt-1">Average hourly focus intensity</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex items-end justify-between h-[180px] gap-2 sm:gap-4 pt-4 z-10"
      >
        {progress?.map((dayData) => {
          const heightPct = (dayData.hours / maxHours) * 100;
          const isHighlight = dayData.day === "Sat" || dayData.day === "Sun";

          return (
            <div
              key={dayData.day}
              className="flex-1 flex flex-col items-center gap-3 group/bar h-full justify-end cursor-pointer"
            >
              {/* Outer bar slot wrapper */}
              <div className="w-full bg-white/5 rounded-t-[3px] h-full flex flex-col justify-end relative">
                {/* Hover Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-surface-container-high border border-white/10 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-on-surface transition-all duration-200 shadow-xl whitespace-nowrap z-20 pointer-events-none scale-90 group-hover/bar:scale-100">
                  {dayData.hours}h
                </div>

                {/* Animated Inner Bar */}
                <motion.div
                  custom={heightPct}
                  variants={barVariants}
                  style={{
                    height: `${heightPct}%`,
                    transformOrigin: "bottom center",
                  }}
                  className={`
                    w-full rounded-t-[3px] transition-colors duration-300 relative
                    ${isHighlight 
                      ? "bg-secondary-fixed shadow-[0_0_15px_rgba(0,255,148,0.2)]" 
                      : "bg-primary-container/40 group-hover/bar:bg-primary-container"
                    }
                  `}
                >
                  {isHighlight && (
                    <div className="w-full h-1.5 bg-secondary-fixed-dim rounded-t-[3px] shadow-[0_0_10px_rgba(0,255,148,0.5)]" />
                  )}
                </motion.div>
              </div>

              {/* Label */}
              <span className={`text-[11px] font-label-caps uppercase tracking-wider ${
                isHighlight ? "text-secondary font-bold" : "text-on-surface-variant/60 group-hover/bar:text-on-surface transition-colors"
              }`}>
                {dayData.day}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
