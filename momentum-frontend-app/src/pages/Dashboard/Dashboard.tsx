import React from "react";
import { motion } from "framer-motion";
import { CurrentSessionCard } from "./components/CurrentSessionCard";
import { StreakCard } from "./components/StreakCard";
import { TodayGoalsCard } from "./components/TodayGoalsCard";
import { WeeklyProgressChart } from "./components/WeeklyProgressChart";
import { FriendsOnlineRow } from "./components/FriendsOnlineRow";
import { ActivityFeedPreview } from "./components/ActivityFeedPreview";
import { useAuthStore } from "../../store/authStore";
import { useStreakQuery } from "../../hooks/useDashboardData";

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: streak } = useStreakQuery();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = user?.username?.split(" ")[0] ?? "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="p-margin-mobile md:p-margin-desktop max-w-6xl mx-auto w-full py-10 flex flex-col gap-8 text-left"
    >
      {/* Personalized Greeting Header */}
      <div className="flex flex-col gap-2 mb-2">
        <span className="text-label-caps text-primary tracking-[0.2em] font-semibold uppercase text-xs">
          Focus Command Center
        </span>
        <h1 className="text-display-lg text-on-surface tracking-tight font-extrabold font-sans">
          {getGreeting()}, {firstName}.
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-1">
          <p className="text-on-surface-variant text-body-lg leading-relaxed">
            You are in the <span className="text-primary font-semibold">Top 5%</span> of active students today.
          </p>
          {streak && (
            <div className="flex items-center gap-3">
              <div className="h-px w-4 bg-white/10" />
              <span className="text-[13px] text-secondary-fixed-dim font-semibold flex items-center gap-1.5">
                🔥 {streak.streakDays}-day streak
              </span>
              <span className="text-on-surface-variant/40 text-xs">·</span>
              <span className="text-[13px] text-on-surface-variant font-medium">
                {streak.hours}h this week
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Row 1: Central Active Session (8 cols) & Streak / Rank Stats (4 cols) */}
        <div className="col-span-12 lg:col-span-8">
          <CurrentSessionCard />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <StreakCard />
        </div>

        {/* Row 2: Deep Work Queue Tasks (8 cols) & Weekly Progress Chart (4 cols) */}
        <div className="col-span-12 lg:col-span-8">
          <TodayGoalsCard />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <WeeklyProgressChart />
        </div>

        {/* Row 3: Friends Online Status Strip (12 cols) */}
        <div className="col-span-12">
          <FriendsOnlineRow />
        </div>

        {/* Row 4: Recent Activity Feed Preview (12 cols) */}
        <div className="col-span-12">
          <ActivityFeedPreview />
        </div>
      </div>
    </motion.div>
  );
};
