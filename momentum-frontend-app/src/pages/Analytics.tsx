import React from "react";
import { motion } from "framer-motion";
import { BarChart2, Clock, Flame, TrendingUp, Sparkles } from "lucide-react";
import { useAnalyticsQuery } from "../hooks/useAnalyticsData";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, sub, delay: d }: { icon: React.ReactNode; value: string; label: string; sub?: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d, duration: 0.35 }}
      className="glass-card rounded-xl p-5 flex flex-col gap-3 text-left"
    >
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <div>
        <p className="font-mono font-extrabold text-3xl tabular-nums text-on-surface">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{label}</p>
        {sub && <p className="text-xs text-on-surface-variant/50 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── Weekly Bar Chart ──────────────────────────────────────────────────────────

function WeeklyBarChart({ data }: { data: { day: string; hours: number; goal: number }[] }) {
  const maxH = Math.max(...data.map((d) => Math.max(d.hours, d.goal)), 8);

  return (
    <div className="flex items-end justify-between gap-3 h-40 px-2">
      {data.map((d, i) => {
        const pct = (d.hours / maxH) * 100;
        const goalPct = (d.goal / maxH) * 100;
        const isHighlight = d.day === "Sat" || d.day === "Sun";

        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar cursor-pointer">
            <div className="relative w-full flex-1 flex items-end h-full">
              {/* Goal line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-white/20 pointer-events-none z-10"
                style={{ bottom: `${goalPct}%` }}
                title={`Goal: ${d.goal}h`}
              />
              {/* Hover Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-surface-container-highest border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-on-surface transition-all duration-200 z-20 pointer-events-none shadow-lg">
                {d.hours}h
              </div>
              {/* Bar (staggered growth height) */}
              <motion.div
                initial={{ height: "0%" }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full rounded-t-[4px] relative overflow-hidden origin-bottom ${
                  isHighlight ? "bg-secondary-fixed shadow-[0_0_12px_rgba(0,255,148,0.15)]" : "bg-primary-container/40"
                }`}
              >
                <div className={`absolute inset-0 ${isHighlight ? "bg-secondary-fixed-dim" : "bg-gradient-to-t from-primary-container/50 to-primary"}`} />
              </motion.div>
            </div>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant">{d.day}</span>
            <span className="text-[10px] font-mono font-bold text-on-surface/85 tabular-nums">{d.hours}h</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

function CategoryBreakdown({ data }: { data: { label: string; hours: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.hours, 0);
  return (
    <div className="flex flex-col gap-4">
      {data.map((item, i) => {
        const pct = Math.round((item.hours / total) * 100);
        return (
          <div key={item.label} className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant font-medium">{item.label}</span>
              <span className="font-mono font-bold text-on-surface tabular-nums">
                {item.hours}h <span className="text-on-surface-variant/50 text-[10px] font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                className={`h-full ${item.color} rounded-full`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Heatmap Calendar (Tween-on-load color intensity) ───────────────────────────

const intensityColorsHSL = [
  "rgba(255, 255, 255, 0.04)",  // Level 0 (None)
  "rgba(108, 92, 231, 0.2)",    // Level 1 (Light)
  "rgba(108, 92, 231, 0.45)",   // Level 2 (Medium)
  "rgba(108, 92, 231, 0.7)",    // Level 3 (High)
  "rgba(108, 92, 231, 1.0)",    // Level 4 (Extreme)
];

function Heatmap({ data }: { data: number[] }) {
  return (
    <div className="text-left">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Activity Map (July)</p>
      <div className="flex flex-wrap gap-2">
        {data.map((intensity, i) => (
          <motion.div
            key={i}
            initial={{ backgroundColor: "rgba(255, 255, 255, 0.04)", scale: 0.85 }}
            animate={{ backgroundColor: intensityColorsHSL[intensity], scale: 1 }}
            transition={{ delay: 0.15 + i * 0.012, duration: 0.55, ease: "easeOut" }}
            title={`Day ${i + 1}: ${intensity > 0 ? intensity + " hours focused" : "No focus recorded"}`}
            className="w-7 h-7 rounded-md cursor-pointer hover:ring-2 hover:ring-primary/60 transition-all duration-100 flex items-center justify-center relative group"
          >
            <span className="text-[9px] font-mono font-bold text-on-surface/30 opacity-0 group-hover:opacity-100 transition-opacity">
              {i + 1}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 w-fit">
        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Less</span>
        {intensityColorsHSL.map((c, i) => (
          <div key={i} className="w-4 h-4 rounded-sm border border-white/5" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">More</span>
      </div>
    </div>
  );
}

// ─── Momentum Coach Insights ─────────────────────────────────────────────────

const mockInsights = [
  {
    icon: "🧠",
    title: "Peak Focus: Tuesdays",
    detail: "You complete 38% more deep work on Tuesdays. Schedule your hardest tasks then.",
    tag: "Pattern",
    tagColor: "text-primary bg-primary/10 border-primary/20",
  },
  {
    icon: "⏱️",
    title: "Ideal Session Length",
    detail: "Your average productive session is 42 min. Sessions beyond 60 min show diminishing returns.",
    tag: "Insight",
    tagColor: "text-secondary-fixed-dim bg-secondary-fixed/10 border-secondary-fixed/20",
  },
  {
    icon: "🌙",
    title: "Evening Slump",
    detail: "Your productivity drops significantly after 8 PM. Consider ending deep work by 7:30 PM.",
    tag: "Warning",
    tagColor: "text-error bg-error/10 border-error/20",
  },
];

function InsightsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-6 text-left mt-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-on-surface text-[15px]">Momentum Coach</h2>
          <p className="text-[11px] text-on-surface-variant mt-0.5">Personalized insights based on your study patterns</p>
        </div>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
          AI-Powered
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockInsights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.07 }}
            className="bg-surface-container-low rounded-xl p-4 border border-white/5 hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-default"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl leading-none">{insight.icon}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${insight.tagColor}`}>
                {insight.tag}
              </span>
            </div>
            <h3 className="text-[13px] font-bold text-on-surface mb-1.5">{insight.title}</h3>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">{insight.detail}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


export function Analytics() {
  const { data, isLoading } = useAnalyticsQuery();

  return (
    <div className="pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-8 text-left">
        <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight flex items-center gap-3">
          <BarChart2 size={28} className="text-primary" />
          Analytics
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">Your study performance at a glance.</p>
      </motion.div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 h-28 animate-pulse bg-surface-container-highest/20" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={<Clock size={18} />} value={`${data.totalHours}h`} label="Total Hours" sub="This month" delay={0} />
            <StatCard icon={<TrendingUp size={18} />} value={`${data.avgDaily}h`} label="Daily Avg" sub="This week" delay={0.04} />
            <StatCard icon={<Flame size={18} />} value={`${data.longestStreak}d`} label="Best Streak" sub="All time" delay={0.08} />
            <StatCard icon={<BarChart2 size={18} />} value={`${data.thisWeekHours}h`} label="This Week" sub="vs 34.5h last week" delay={0.12} />
          </div>

          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Intensity bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-6 lg:col-span-2 text-left"
            >
              <h2 className="font-bold text-on-surface mb-1">Weekly Intensity</h2>
              <p className="text-xs text-on-surface-variant mb-6 font-medium">Daily study hours vs. 6h goal</p>
              <WeeklyBarChart data={data.weeklyData} />
            </motion.div>

            {/* Category Focus Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 text-left"
            >
              <h2 className="font-bold text-on-surface mb-1">By Subject</h2>
              <p className="text-xs text-on-surface-variant mb-6 font-medium">Hours per category this month</p>
              <CategoryBreakdown data={data.categoryBreakdown} />
            </motion.div>

            {/* Activity Heatmap Grid */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card rounded-2xl p-6 lg:col-span-3"
            >
              <Heatmap data={data.monthlyHeatmap} />
            </motion.div>
          </div>

          {/* Momentum Coach Insights */}
          <InsightsPanel />
        </>
      )}
    </div>
  );
}

