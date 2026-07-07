import React from "react";
import { useNavigate } from "react-router-dom";
import { useGoalsQuery, type Goal } from "../../../hooks/useDashboardData";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Badge } from "../../../components/ui/Badge";
import { CheckSquare, Play, ArrowRight } from "lucide-react";

export const TodayGoalsCard: React.FC = () => {
  const { data: goals, isLoading, toggleGoal } = useGoalsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4 text-left">
        <div className="flex justify-between items-end mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="h-44 rounded-xl border border-white/10 bg-surface/50 p-6 animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-white/10 bg-surface/50 p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  const incompleteGoals = goals?.filter((g) => !g.completed) ?? [];
  const completedGoals = goals?.filter((g) => g.completed) ?? [];
  const nextGoal = incompleteGoals[0];
  const remainingGoals = incompleteGoals.slice(1);

  const categoryVariants: Record<Goal["category"], "default" | "secondary" | "streak"> = {
    ACADEMIC: "default",
    RESEARCH: "secondary",
    PROJECT: "streak",
  };

  return (
    <div className="w-full text-left space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <h2 className="text-headline-lg text-on-surface font-bold tracking-tight">
          Deep Work Queue
        </h2>
        <button className="text-primary text-label-caps font-semibold tracking-widest hover:underline hover:brightness-110 transition-all text-[11px]">
          VIEW ALL
        </button>
      </div>

      {/* Hero "NEXT TASK" card */}
      {nextGoal && (
        <div
          className="relative rounded-xl border border-primary-container/30 bg-gradient-to-br from-primary-container/10 via-surface to-surface overflow-hidden cursor-pointer group hover:border-primary-container/60 hover:shadow-[0_0_24px_rgba(108,92,231,0.12)] hover:-translate-y-0.5 transition-all duration-300"
          onClick={() => navigate("/focus/active")}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container rounded-l-xl" />
          <div className="p-6 pl-7">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Play size={11} className="fill-primary text-primary" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
                    Next Task
                  </span>
                </div>
                <Badge variant={categoryVariants[nextGoal.category]}>
                  {nextGoal.category}
                </Badge>
              </div>
              <span className="text-label-caps text-on-surface-variant font-medium text-[11px] tracking-wider bg-surface-container-high px-2.5 py-1 rounded-full border border-white/5">
                EST {nextGoal.est}
              </span>
            </div>
            <h3 className="text-[22px] font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors duration-200">
              {nextGoal.title}
            </h3>
            <p className="text-on-surface-variant text-[13px] leading-relaxed mb-5 line-clamp-2">
              {nextGoal.desc}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/focus/active"); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-[13px] hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-[0_4px_14px_rgba(108,92,231,0.3)]"
            >
              Start Session
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Compact remaining list */}
      <div className="space-y-2">
        {remainingGoals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-white/[0.06] bg-surface hover:bg-surface-container-high hover:border-white/10 cursor-pointer group transition-all duration-200 hover:-translate-y-px"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30 shrink-0" />
              <span className="text-[14px] font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                {goal.title}
              </span>
              <Badge variant={categoryVariants[goal.category]}>{goal.category}</Badge>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium tracking-wide shrink-0 ml-4">
              {goal.est}
            </span>
          </div>
        ))}

        {completedGoals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-white/5 bg-surface/40 cursor-pointer group opacity-50 hover:opacity-70 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <CheckSquare size={15} className="text-signal-green shrink-0" />
              <span className="text-[14px] text-on-surface-variant line-through truncate">
                {goal.title}
              </span>
            </div>
            <span className="text-[11px] text-signal-green font-bold tracking-wider shrink-0 ml-4">
              DONE
            </span>
          </div>
        ))}

        {incompleteGoals.length === 0 && completedGoals.length > 0 && (
          <div className="text-center py-4 text-signal-green text-sm font-semibold">
            All tasks completed for today!
          </div>
        )}
      </div>
    </div>
  );
};
