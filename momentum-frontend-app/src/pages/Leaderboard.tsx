import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";
import { useLeaderboardQuery, type LeaderboardEntry } from "../hooks/useAnalyticsData";

// ─── Delta Badge ──────────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <Minus size={11} className="text-on-surface-variant/40" />;
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-signal-green text-[10px] font-bold">
      <TrendingUp size={11} />+{delta}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-error text-[10px] font-bold">
      <TrendingDown size={11} />{delta}
    </span>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank, badge }: { rank: number; badge?: string }) {
  if (badge) return <span className="text-lg leading-none">{badge}</span>;
  const colors: Record<number, string> = {
    1: "text-yellow-400 font-extrabold",
    2: "text-slate-400 font-extrabold",
    3: "text-amber-600 font-extrabold",
  };
  return (
    <span className={`font-mono font-bold tabular-nums text-xs ${colors[rank] ?? "text-on-surface-variant"}`}>
      #{rank}
    </span>
  );
}

// ─── Count-up Score Component ──────────────────────────────────────────────────

function CountUpScore({ target }: { target: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    if (start === target) return;
    const increment = Math.ceil(target / 15) || 1;
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setVal(target);
        clearInterval(interval);
      } else {
        setVal(start);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [target]);

  // Handle floats if needed
  return <span className="font-mono font-extrabold tabular-nums text-sm text-on-surface">{val}h</span>;
}

// ─── Leaderboard Row ───────────────────────────────────────────────────────────

interface RowProps {
  entry: LeaderboardEntry;
  variants?: any;
  innerRef?: React.Ref<HTMLDivElement>;
}

function LeaderboardRow({ entry, variants, innerRef }: RowProps) {
  return (
    <motion.div
      ref={innerRef}
      variants={variants}
      className={`grid grid-cols-[2.5rem_1fr_4.5rem_4rem_2rem] gap-4 px-6 py-4 items-center border-b border-white/5 last:border-b-0
        ${entry.isCurrentUser ? "bg-primary-container/10 border-l-2 border-primary" : "hover:bg-white/5 transition-colors duration-200"}`}
    >
      {/* Rank */}
      <div className="flex items-center">
        <RankBadge rank={entry.rank} badge={entry.badge} />
      </div>

      {/* Name / Profile */}
      <div className="flex items-center gap-3 min-w-0 text-left">
        <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0
          ${entry.isCurrentUser ? "border-primary bg-primary-container/20" : "border-white/10 bg-surface-container-high"}`}>
          <span className={`text-xs font-bold ${entry.isCurrentUser ? "text-primary" : "text-on-surface-variant"}`}>
            {entry.initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-on-surface truncate flex items-center gap-1.5">
            {entry.name}
            {entry.isCurrentUser && <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold uppercase">You</span>}
          </p>
          <p className="text-[10px] text-on-surface-variant/70 truncate mt-0.5">{entry.college}</p>
        </div>
      </div>

      {/* Hours */}
      <div className="text-left">
        <CountUpScore target={entry.focusHours} />
      </div>

      {/* Streak */}
      <span className="text-xs font-medium text-on-surface-variant/80 tabular-nums text-left">{entry.streak}d 🔥</span>

      {/* Delta */}
      <div className="flex items-center justify-end">
        <DeltaBadge delta={entry.delta} />
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type Period = "weekly" | "monthly" | "all-time";

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>("weekly");
  const { data = [], isLoading } = useLeaderboardQuery(period);

  const userRowRef = useRef<HTMLDivElement | null>(null);
  const [isUserRowVisible, setIsUserRowVisible] = useState(true);

  const visibleEntries = data.slice(0, 10);
  const currentUserEntry = data.find((e) => e.isCurrentUser);
  const isUserOutsideTopTen = currentUserEntry ? currentUserEntry.rank > 10 : false;

  // Observe if the current user's row is visible in the viewport
  useEffect(() => {
    // If user is outside top 10, the row is not even rendered in the table, so it's not visible
    if (isUserOutsideTopTen) {
      setIsUserRowVisible(false);
      return;
    }

    const el = userRowRef.current;
    if (!el) {
      setIsUserRowVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUserRowVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [data, isUserOutsideTopTen]);

  // Row transition variables
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03, // 30ms delay per row
        delayChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  };

  return (
    <div className="pb-16 max-w-3xl mx-auto relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-8 text-left">
        <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight flex items-center gap-3">
          <Trophy size={28} className="text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">Top focus performers ranked by study hours.</p>
      </motion.div>

      {/* Period filter pills with sliding crossfade */}
      <div className="flex gap-1 p-1 bg-surface-container-high rounded-xl w-fit mb-8">
        {(["weekly", "monthly", "all-time"] as const).map((p) => (
          <button
            key={p}
            onClick={() => {
              setPeriod(p);
              setIsUserRowVisible(true); // reset state while loading
            }}
            className={`relative px-5 py-2.5 rounded-lg text-xs font-bold transition-all capitalize focus:outline-none ${
              period === p ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {period === p && (
              <motion.div
                layoutId="leaderboard-period-indicator"
                className="absolute inset-0 bg-surface-container-highest rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10">{p}</span>
          </button>
        ))}
      </div>

      {/* Motivational Banner */}
      {!isLoading && currentUserEntry && (() => {
        const rankAbove = data.find(e => e.rank === currentUserEntry.rank - 1);
        if (!rankAbove) return null;
        const gap = (rankAbove.focusHours - currentUserEntry.focusHours);
        const gapStr = gap > 0 ? gap.toFixed(1) : "0";
        const dailyTarget = Math.min(gap, 2).toFixed(0);
        return (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-5 px-5 py-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-on-surface">
                Only <span className="text-primary font-bold">{gapStr}h</span> to beat #{rankAbove.rank} · Study <span className="text-secondary-fixed-dim font-bold">{dailyTarget}h today</span> to reach Rank #{rankAbove.rank}
              </p>
              <div className="mt-1.5 h-1.5 bg-surface-container-highest rounded-full overflow-hidden w-full max-w-xs">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((currentUserEntry.focusHours / rankAbove.focusHours) * 100)}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                />
              </div>
            </div>
            <span className="text-[11px] text-on-surface-variant shrink-0 font-medium">
              Rank #{currentUserEntry.rank} → #{rankAbove.rank}
            </span>
          </motion.div>
        );
      })()}

      {/* Table Container */}
      <div className="glass-card rounded-2xl overflow-hidden relative border border-white/5 shadow-xl">
        {/* Table header */}
        <div className="grid grid-cols-[2.5rem_1fr_4.5rem_4rem_2rem] gap-4 px-6 py-3 bg-surface-container-high border-b border-white/5 text-left">
          {["#", "Student", "Hours", "Streak", "Δ"].map((h, i) => (
            <span key={h} className={`text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ${i === 4 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2.5rem_1fr_4.5rem_4rem_2rem] gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 w-5 bg-surface-container-highest rounded" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
                  <div className="h-4 w-32 bg-surface-container-highest rounded-lg" />
                </div>
                <div className="h-4 w-12 bg-surface-container-highest rounded" />
                <div className="h-4 w-8 bg-surface-container-highest rounded" />
                <div className="h-4 w-4 bg-surface-container-highest rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            {visibleEntries.map((entry) => (
              <LeaderboardRow
                key={entry.rank}
                entry={entry}
                variants={rowVariants}
                innerRef={entry.isCurrentUser ? userRowRef : undefined}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Sticky Own Rank Row (appears if user is outside visible range) */}
      <AnimatePresence>
        {!isLoading && currentUserEntry && (!isUserRowVisible || isUserOutsideTopTen) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="fixed bottom-[16px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-3xl glass-card rounded-2xl border-2 border-primary bg-background/95 shadow-2xl z-40 overflow-hidden"
          >
            <div className="px-6 py-1 bg-primary/10 border-b border-primary/20 text-[9px] font-bold text-primary uppercase tracking-widest text-center">
              Your Position outside Visible Range
            </div>
            <LeaderboardRow entry={currentUserEntry} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
