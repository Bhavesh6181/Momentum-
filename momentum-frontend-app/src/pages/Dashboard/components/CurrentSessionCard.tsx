import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentSessionQuery } from "../../../hooks/useDashboardData";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Button } from "../../../components/ui/Button";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";

export const CurrentSessionCard: React.FC = () => {
  const { data: session, isLoading } = useCurrentSessionQuery();
  const navigate = useNavigate();

  const [isRunning, setIsRunning] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isFlashed, setIsFlashed] = useState(false);

  // Synchronize with initial resolver value once loaded
  useEffect(() => {
    if (session) {
      setSeconds(session.seconds);
    }
  }, [session]);

  // Simulated tick for dashboard view
  useEffect(() => {
    if (!isRunning || !session) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, session]);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
    setIsFlashed(true);
    setTimeout(() => setIsFlashed(false), 300);
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  if (isLoading) {
    return (
      <div className="h-[400px] rounded-xl border border-white/10 bg-surface/50 p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-3/4 mx-auto mt-16" />
        </div>
        <div className="flex gap-4 justify-center mt-auto">
          <Skeleton className="h-12 w-44 rounded-xl" />
          <Skeleton className="h-12 w-28 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ transition: "background-color 500ms ease-out" }}
      className={`
        relative h-[400px] rounded-xl border border-white/10 overflow-hidden flex flex-col items-center justify-center p-8 select-none
        ${isFlashed ? "bg-primary-container/20 scale-[1.01] transition-all" : "bg-surface"}
      `}
    >
      {/* Background glow pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container/5 via-transparent to-transparent pointer-events-none" />

      <span className="text-label-caps text-primary tracking-[0.3em] mb-4 flex items-center gap-2">
        <Zap size={14} className="animate-pulse" />
        SESSION ACTIVE
      </span>

      <div className="text-[72px] sm:text-[100px] md:text-[120px] font-stats-md leading-none tabular-nums text-on-surface tracking-tighter my-4">
        {formatTime(seconds)}
      </div>

      <p className="text-on-surface-variant text-[14px] uppercase tracking-wider mb-8">
        Subject: <span className="text-on-surface font-semibold">{session?.category}</span>
      </p>

      <div className="flex flex-wrap gap-4 justify-center z-10">
        <Button
          variant="primary"
          onClick={handleToggle}
          className="px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 active:scale-95 transition-all duration-300"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "PAUSE SESSION" : "RESUME SESSION"}
        </Button>

        <Button
          variant="ghost"
          onClick={handleReset}
          className="border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface transition-all duration-300"
        >
          <RotateCcw size={16} className="mr-2" />
          RESET
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate("/focus/active")}
          className="border border-primary-container/30 hover:border-primary-container/60 px-8 py-3.5 rounded-xl font-bold text-primary hover:bg-primary-container/10 transition-all duration-300"
        >
          FULLSCREEN MODE
        </Button>
      </div>

      {/* Mini progress bar at bottom */}
      <div
        style={{ width: `${Math.min(100, (seconds / 3600) * 100)}%` }}
        className="absolute bottom-0 left-0 h-1 bg-primary-container transition-all duration-1000 ease-out"
      />
    </div>
  );
};
