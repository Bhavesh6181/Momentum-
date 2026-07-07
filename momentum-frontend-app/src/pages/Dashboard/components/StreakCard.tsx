import React, { useState, useEffect } from "react";
import { useStreakQuery } from "../../../hooks/useDashboardData";
import { Skeleton } from "../../../components/ui/Skeleton";
import { TrendingUp, ChevronRight, Trophy, Flame } from "lucide-react";

export const StreakCard: React.FC = () => {
  const { data: streak, isLoading } = useStreakQuery();
  const [animatedHours, setAnimatedHours] = useState(0);

  // Simulated count-up animation on load
  useEffect(() => {
    if (!streak) return;
    let start = 0;
    const end = streak.hours;
    if (start === end) return;

    const totalDuration = 1000; // 1s
    const incrementTime = Math.max(10, Math.floor(totalDuration / end));

    const timer = setInterval(() => {
      start += 1;
      setAnimatedHours(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [streak]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 h-[400px]">
        <div className="flex-1 rounded-xl border border-white/10 bg-surface/50 p-6 flex flex-col justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-24 mt-4" />
          <Skeleton className="h-4 w-36 mt-2" />
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="h-28 rounded-xl border border-white/10 bg-surface/50 p-6 flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[400px] text-left">
      {/* Top statistics card */}
      <div className="flex-1 rounded-xl border border-white/10 bg-surface p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary-container/5 via-transparent to-transparent pointer-events-none" />
        <div>
          <span className="text-label-caps text-on-surface-variant tracking-widest block mb-2">
            GLOBAL PERFORMANCE
          </span>
          <div className="mt-4">
            <div className="text-[56px] font-stats-md text-on-surface leading-none tabular-nums font-bold">
              {animatedHours}
              <span className="text-headline-md text-on-surface-variant ml-2">h</span>
            </div>
            <div className="text-body-sm text-secondary-fixed-dim mt-3 flex items-center gap-1.5 font-semibold">
              <TrendingUp size={16} />
              {streak?.change}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5 z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Flame size={18} />
            </div>
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant tracking-wider uppercase">STREAK</div>
              <div className="text-[14px] font-stats-md font-bold text-on-surface leading-none mt-1">
                {streak?.streakDays} DAYS
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <Trophy size={16} />
            </div>
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant tracking-wider uppercase">RANK</div>
              <div className="text-[14px] font-stats-md font-bold text-on-surface leading-none mt-1">
                {streak?.rank}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Milestone Card */}
      <div className="h-28 rounded-xl border border-white/10 bg-surface p-6 flex items-center justify-between group cursor-pointer hover:border-primary-container/40 transition-all duration-300">
        <div>
          <span className="text-label-caps text-on-surface-variant tracking-widest text-[10px] block">
            NEXT MILESTONE
          </span>
          <p className="text-[15px] font-bold text-on-surface mt-2 group-hover:text-primary transition-colors leading-tight">
            {streak?.nextMilestone}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container group-hover:border-primary-container transition-all duration-300">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};
