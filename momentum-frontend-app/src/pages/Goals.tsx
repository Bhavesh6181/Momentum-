import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, Users, Circle, Plus, Trash2 } from "lucide-react";
import {
  useChallengesQuery,
  useGoalsQuery,
  useCompleteGoalMutation,
  useAddGoalMutation,
  useJoinChallengeMutation,
  type Goal,
  type Challenge
} from "../hooks/useChallengesData";

// ─── Difficulty Badge styling ──────────────────────────────────────────────────

const difficultyColors = {
  easy: "text-secondary-fixed-dim border-secondary-fixed-dim/40 bg-secondary-fixed-dim/10",
  medium: "text-tertiary border-tertiary/40 bg-tertiary/10",
  hard: "text-error border-error/40 bg-error/10",
};

// ─── Count-up percentage text component ──────────────────────────────────────────

function CountUpPercent({ target }: { target: number }) {
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
    }, 30);
    return () => clearInterval(interval);
  }, [target]);

  return <span className="tabular-nums font-mono">{val}%</span>;
}

// ─── SVG checkmark stroke-draw animation ───────────────────────────────────────

function StrokeCheckmark() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-secondary-fixed-dim shrink-0" fill="none">
      <motion.path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}

// ─── Challenge Card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  const joinMutation = useJoinChallengeMutation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="glass-card rounded-xl p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(108,92,231,0.1)] transition-all duration-300"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <span
            className={`px-2 py-0.5 border text-[10px] font-bold rounded-full w-fit uppercase tracking-wider ${difficultyColors[challenge.difficulty]}`}
          >
            {challenge.difficulty}
          </span>
          <h3 className="font-bold text-on-surface text-sm leading-snug mt-1">{challenge.title}</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">{challenge.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-extrabold font-mono text-primary tabular-nums">+{challenge.xpReward}</p>
          <p className="text-[10px] text-on-surface-variant font-bold">XP</p>
        </div>
      </div>

      {challenge.isJoined && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            <span>Progress</span>
            <CountUpPercent target={challenge.progress} />
          </div>
          <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${challenge.progress}%` }}
              transition={{ delay: 0.2 + index * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-4 text-on-surface-variant text-xs font-semibold">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {challenge.participants}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {challenge.daysLeft}d left
          </span>
        </div>
        {challenge.isJoined ? (
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">
            Joined
          </span>
        ) : (
          <button
            onClick={() => joinMutation.mutate(challenge.id)}
            disabled={joinMutation.isPending}
            className="px-3 py-1.5 bg-primary-container text-on-primary-container text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Join Challenge
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Goal Row ─────────────────────────────────────────────────────────────────

function GoalRow({ goal, onComplete }: { goal: Goal; onComplete: (id: string) => void }) {
  const [completing, setCompleting] = useState(false);

  const handleMarkComplete = () => {
    if (goal.status === "done") return;
    setCompleting(true);
    // Let stroke animation complete before calling backend mutation
    setTimeout(() => {
      onComplete(goal.id);
    }, 450);
  };

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group transition-all duration-300 ${
        goal.status === "done" ? "opacity-40" : ""
      }`}
    >
      {/* Interactive Checkbox */}
      <button
        onClick={handleMarkComplete}
        className="focus:outline-none shrink-0"
        aria-label={`Mark "${goal.title}" as complete`}
        disabled={goal.status === "done" || completing}
      >
        {goal.status === "done" || completing ? (
          <StrokeCheckmark />
        ) : (
          <Circle size={18} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
        )}
      </button>

      {/* Goal Title */}
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-medium leading-snug transition-all ${
          goal.status === "done" ? "line-through text-on-surface-variant" : "text-on-surface"
        }`}>
          {goal.title}
        </p>
        {goal.dueDate && goal.status !== "done" && (
          <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">Due {goal.dueDate}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
          {goal.category}
        </span>
        {goal.priority && goal.status !== "done" && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            goal.priority === "high" ? "text-error" : goal.priority === "medium" ? "text-tertiary" : "text-on-surface-variant/70"
          }`}>
            {goal.priority}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────────

export function Goals() {
  const { data: challenges = [], isLoading: challengesLoading } = useChallengesQuery();
  const { data: goals = [], isLoading: goalsLoading } = useGoalsQuery();
  const completeMutation = useCompleteGoalMutation();
  const addGoalMutation = useAddGoalMutation();

  const [filter, setFilter] = useState<"all" | "joined" | "available">("all");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("General");
  const [newGoalPriority, setNewGoalPriority] = useState<"low" | "medium" | "high">("medium");

  const filteredChallenges = filter === "all"
    ? challenges
    : filter === "joined"
      ? challenges.filter((c) => c.isJoined)
      : challenges.filter((c) => !c.isJoined);

  const activeGoals = goals.filter((g) => g.status !== "done");
  const completedGoals = goals.filter((g) => g.status === "done");

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    await addGoalMutation.mutateAsync({
      title: newGoalTitle,
      category: newGoalCategory,
      priority: newGoalPriority
    });
    setNewGoalTitle("");
  };

  return (
    <div className="pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-8 text-left">
        <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight">Goals & Challenges</h1>
        <p className="text-on-surface-variant mt-1 text-sm">Track your personal goals and join community challenges.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left: Goals Board (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-on-surface flex items-center gap-2">
              <Zap size={18} className="text-tertiary" />
              My Goals
              <span className="text-on-surface-variant font-normal text-sm">({goals.length})</span>
            </h2>
          </div>

          {/* Add Goal form */}
          <form onSubmit={handleCreateGoal} className="glass-card p-4 rounded-xl flex flex-col sm:flex-row gap-3 border border-white/5">
            <input
              type="text"
              placeholder="Add a new academic goal…"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="flex-1 bg-surface-container-high border border-white/10 px-4 py-2.5 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                className="bg-surface-container-high border border-white/10 px-3 py-2 rounded-lg text-xs text-on-surface-variant focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Coding">Coding</option>
                <option value="Physics">Physics</option>
                <option value="Research">Research</option>
                <option value="Math">Math</option>
              </select>
              <select
                value={newGoalPriority}
                onChange={(e) => setNewGoalPriority(e.target.value as any)}
                className="bg-surface-container-high border border-white/10 px-3 py-2 rounded-lg text-xs text-on-surface-variant focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                disabled={addGoalMutation.isPending}
                className="bg-primary-container text-on-primary-container font-bold px-4 py-2 rounded-lg text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>
          </form>

          {/* Goals lists */}
          {goalsLoading ? (
            <div className="glass-card rounded-xl p-6 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest mt-2" />
                  <div className="flex-1 h-4 bg-surface-container-highest rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 relative flex flex-col gap-6">
              {/* Active Goals */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-3 text-left">
                  Active Goals ({activeGoals.length})
                </p>
                <motion.div layout className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {activeGoals.map((g) => (
                      <GoalRow
                        key={g.id}
                        goal={g}
                        onComplete={(id) => completeMutation.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
                {activeGoals.length === 0 && (
                  <p className="text-xs text-on-surface-variant py-4 text-center">All goals complete! Procrastination defeated.</p>
                )}
              </div>

              {/* Completed Goals Section (Collapsing / Opacity reduced) */}
              {completedGoals.length > 0 && (
                <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-fixed-dim mb-3 text-left">
                    Completed ({completedGoals.length})
                  </p>
                  <motion.div layout className="flex flex-col">
                    <AnimatePresence>
                      {completedGoals.map((g) => (
                        <GoalRow
                          key={g.id}
                          goal={g}
                          onComplete={() => {}}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Challenges (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-on-surface text-left">Community Challenges</h2>
          </div>

          {/* Filter Pills with Crossfade Indicator */}
          <div className="flex gap-1 p-1 bg-surface-container-high rounded-xl w-fit">
            {(["all", "joined", "available"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize focus:outline-none ${
                  filter === f ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {filter === f && (
                  <motion.div
                    layoutId="goals-filter-crossfade"
                    className="absolute inset-0 bg-surface-container-highest rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>

          {/* Challenges list */}
          {challengesLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-6 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filteredChallenges.map((c, i) => (
                  <ChallengeCard key={c.id} challenge={c} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
