import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "coding" | "math" | "research" | "reading";
  difficulty: "easy" | "medium" | "hard";
  deadline: string;
  participants: number;
  progress: number; // 0-100
  xpReward: number;
  isJoined: boolean;
  daysLeft: number;
}

export interface Goal {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  category: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockChallenges: Challenge[] = [
  { id: "c1", title: "30-Day Code Marathon", description: "Solve at least one algorithm problem every day for 30 days.", category: "coding", difficulty: "hard", deadline: "Jul 31", participants: 342, progress: 65, xpReward: 500, isJoined: true, daysLeft: 12 },
  { id: "c2", title: "Research Paper Sprint", description: "Read and summarize 10 research papers in your field this month.", category: "research", difficulty: "medium", deadline: "Jul 25", participants: 128, progress: 40, xpReward: 300, isJoined: true, daysLeft: 6 },
  { id: "c3", title: "Linear Algebra Blitz", description: "Complete 50 matrix operations problems with 90%+ accuracy.", category: "math", difficulty: "medium", deadline: "Aug 5", participants: 215, progress: 0, xpReward: 250, isJoined: false, daysLeft: 18 },
  { id: "c4", title: "Reading Challenge — 5 Books", description: "Read 5 non-fiction books relevant to your career goals this summer.", category: "reading", difficulty: "easy", deadline: "Aug 31", participants: 891, progress: 60, xpReward: 200, isJoined: true, daysLeft: 44 },
];

const mockGoals: Goal[] = [
  { id: "g1", title: "Complete DSA course module 7", status: "in_progress", priority: "high", dueDate: "Jul 8", category: "Coding" },
  { id: "g2", title: "Summarize quantum entanglement paper", status: "todo", priority: "medium", dueDate: "Jul 10", category: "Research" },
  { id: "g3", title: "Mock interview practice session", status: "todo", priority: "high", dueDate: "Jul 7", category: "Career" },
  { id: "g4", title: "Review calculus integration techniques", status: "done", priority: "low", category: "Math" },
  { id: "g5", title: "Write weekly reflection journal", status: "done", priority: "low", category: "Habits" },
  { id: "g6", title: "Set up research bibliography", status: "in_progress", priority: "medium", dueDate: "Jul 12", category: "Research" },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useChallengesQuery() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => { await delay(400); return [...mockChallenges]; },
    staleTime: 5_000,
  });
}

export function useGoalsQuery() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => { await delay(300); return [...mockGoals]; },
    staleTime: 5_000,
  });
}

export function useCompleteGoalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      await delay(300);
      const g = mockGoals.find(x => x.id === goalId);
      if (g) {
        g.status = "done";
      }
      return g;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    }
  });
}

export function useAddGoalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; category: string; priority: "low" | "medium" | "high" }) => {
      await delay(300);
      const newGoal: Goal = {
        id: `g-${Date.now()}`,
        title: data.title,
        status: "todo",
        priority: data.priority,
        category: data.category,
        dueDate: new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      mockGoals.push(newGoal);
      return newGoal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    }
  });
}

export function useJoinChallengeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(300);
      const c = mockChallenges.find(x => x.id === id);
      if (c) {
        c.isJoined = true;
        c.participants += 1;
      }
      return c;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
    }
  });
}
