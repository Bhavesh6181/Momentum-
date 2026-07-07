import { useQuery } from "@tanstack/react-query";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  college: string;
  focusHours: number;
  streak: number;
  delta: number; // rank change
  isCurrentUser?: boolean;
  badge?: string;
}

export interface AnalyticsSummary {
  totalHours: number;
  avgDaily: number;
  longestStreak: number;
  thisWeekHours: number;
  weeklyData: { day: string; hours: number; goal: number }[];
  categoryBreakdown: { label: string; hours: number; color: string }[];
  monthlyHeatmap: number[]; // 0-4 intensity per day
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const weeklyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Anika Sharma", initials: "AS", college: "IIT Bombay", focusHours: 84.5, streak: 32, delta: 0, badge: "👑" },
  { rank: 2, name: "Rohan Mehta", initials: "RM", college: "NIT Trichy", focusHours: 78.2, streak: 28, delta: 1 },
  { rank: 3, name: "Priya Nair", initials: "PN", college: "BITS Pilani", focusHours: 73.8, streak: 21, delta: -1 },
  { rank: 4, name: "You", initials: "YO", college: "IITK", focusHours: 68.5, streak: 14, delta: 2, isCurrentUser: true },
  { rank: 5, name: "Karthik Iyer", initials: "KI", college: "VIT Vellore", focusHours: 65.0, streak: 18, delta: -1 },
  { rank: 6, name: "Mina Patel", initials: "MP", college: "IIT Delhi", focusHours: 62.3, streak: 11, delta: 3 },
  { rank: 7, name: "Arjun Das", initials: "AD", college: "NSIT Delhi", focusHours: 59.9, streak: 9, delta: -2 },
  { rank: 8, name: "Lena Verma", initials: "LV", college: "Manipal", focusHours: 55.7, streak: 7, delta: 0 },
  { rank: 9, name: "Omar Sheikh", initials: "OS", college: "DTU", focusHours: 52.1, streak: 5, delta: 1 },
  { rank: 10, name: "Shreya Pillai", initials: "SP", college: "CEG Anna Univ", focusHours: 48.4, streak: 6, delta: -1 },
];

const monthlyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Rohan Mehta", initials: "RM", college: "NIT Trichy", focusHours: 324.5, streak: 28, delta: 2, badge: "👑" },
  { rank: 2, name: "Anika Sharma", initials: "AS", college: "IIT Bombay", focusHours: 310.2, streak: 32, delta: -1 },
  { rank: 3, name: "Karthik Iyer", initials: "KI", college: "VIT Vellore", focusHours: 290.8, streak: 18, delta: 2 },
  { rank: 4, name: "Priya Nair", initials: "PN", college: "BITS Pilani", focusHours: 280.0, streak: 21, delta: -1 },
  { rank: 5, name: "Mina Patel", initials: "MP", college: "IIT Delhi", focusHours: 275.4, streak: 11, delta: 1 },
  { rank: 6, name: "Arjun Das", initials: "AD", college: "NSIT Delhi", focusHours: 260.1, streak: 9, delta: 1 },
  { rank: 7, name: "Lena Verma", initials: "LV", college: "Manipal", focusHours: 250.6, streak: 7, delta: 1 },
  { rank: 8, name: "Omar Sheikh", initials: "OS", college: "DTU", focusHours: 242.0, streak: 5, delta: 1 },
  { rank: 9, name: "Shreya Pillai", initials: "SP", college: "CEG Anna Univ", focusHours: 230.8, streak: 6, delta: 1 },
  { rank: 10, name: "Ravi Kumar", initials: "RK", college: "BITS", focusHours: 220.5, streak: 8, delta: 1 },
  { rank: 11, name: "Aria Stark", initials: "AS", college: "Winterfell", focusHours: 215.0, streak: 12, delta: 0 },
  { rank: 12, name: "You", initials: "YO", college: "IITK", focusHours: 210.5, streak: 14, delta: -4, isCurrentUser: true },
  { rank: 13, name: "John Doe", initials: "JD", college: "MIT", focusHours: 195.2, streak: 4, delta: 0 },
  { rank: 14, name: "Sarah Connor", initials: "SC", college: "Stanford", focusHours: 180.0, streak: 10, delta: 0 },
];

const allTimeLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Anika Sharma", initials: "AS", college: "IIT Bombay", focusHours: 1240.5, streak: 32, delta: 0, badge: "👑" },
  { rank: 2, name: "Rohan Mehta", initials: "RM", college: "NIT Trichy", focusHours: 1180.2, streak: 28, delta: 0 },
  { rank: 3, name: "Priya Nair", initials: "PN", college: "BITS Pilani", focusHours: 1050.8, streak: 21, delta: 0 },
  { rank: 4, name: "Karthik Iyer", initials: "KI", college: "VIT Vellore", focusHours: 990.0, streak: 18, delta: 0 },
  { rank: 5, name: "Mina Patel", initials: "MP", college: "IIT Delhi", focusHours: 940.4, streak: 11, delta: 0 },
  { rank: 6, name: "Arjun Das", initials: "AD", college: "NSIT Delhi", focusHours: 910.1, streak: 9, delta: 0 },
  { rank: 7, name: "Lena Verma", initials: "LV", college: "Manipal", focusHours: 890.6, streak: 7, delta: 0 },
  { rank: 8, name: "Omar Sheikh", initials: "OS", college: "DTU", focusHours: 880.0, streak: 5, delta: 0 },
  { rank: 9, name: "Shreya Pillai", initials: "SP", college: "CEG Anna Univ", focusHours: 870.8, streak: 6, delta: 0 },
  { rank: 10, name: "Ravi Kumar", initials: "RK", college: "BITS", focusHours: 865.5, streak: 8, delta: 0 },
  { rank: 25, name: "You", initials: "YO", college: "IITK", focusHours: 850.0, streak: 14, delta: 0, isCurrentUser: true },
];

const analytics: AnalyticsSummary = {
  totalHours: 284,
  avgDaily: 5.8,
  longestStreak: 21,
  thisWeekHours: 38.5,
  weeklyData: [
    { day: "Mon", hours: 6.5, goal: 6 },
    { day: "Tue", hours: 8.0, goal: 6 },
    { day: "Wed", hours: 5.5, goal: 6 },
    { day: "Thu", hours: 7.0, goal: 6 },
    { day: "Fri", hours: 4.5, goal: 6 },
    { day: "Sat", hours: 5.0, goal: 6 },
    { day: "Sun", hours: 2.0, goal: 6 },
  ],
  categoryBreakdown: [
    { label: "CS / Coding", hours: 98, color: "bg-primary-container" },
    { label: "Mathematics", hours: 62, color: "bg-tertiary" },
    { label: "Research", hours: 45, color: "bg-secondary-fixed-dim" },
    { label: "Reading", hours: 38, color: "bg-secondary-container" },
    { label: "Other", hours: 41, color: "bg-surface-container-highest" },
  ],
  monthlyHeatmap: Array.from({ length: 31 }, () => Math.floor(Math.random() * 5)),
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLeaderboardQuery(period: "weekly" | "monthly" | "all-time" = "weekly") {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      await delay(450);
      if (period === "weekly") return [...weeklyLeaderboard];
      if (period === "monthly") return [...monthlyLeaderboard];
      return [...allTimeLeaderboard];
    },
    staleTime: 5_000,
  });
}

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => { await delay(400); return analytics; },
    staleTime: 5_000,
  });
}
