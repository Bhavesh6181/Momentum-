import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Goal {
  id: string;
  title: string;
  category: "ACADEMIC" | "RESEARCH" | "PROJECT";
  desc: string;
  est: string;
  completed: boolean;
}

export interface Friend {
  name: string;
  avatar: string;
  status: "studying" | "online" | "away" | "offline";
  time?: string;
}

export interface Activity {
  id: string;
  username: string;
  action: string;
  time: string;
}

export interface WeeklyProgress {
  day: string;
  hours: number;
}

// Simulated latency resolver helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useCurrentSessionQuery = () => {
  return useQuery({
    queryKey: ["dashboard", "currentSession"],
    queryFn: async () => {
      await delay(500);
      return {
        isActive: true,
        seconds: 2538, // 00:42:18
        category: "Quantum Physics II",
      };
    },
  });
};

export const useStreakQuery = () => {
  return useQuery({
    queryKey: ["dashboard", "streak"],
    queryFn: async () => {
      await delay(700);
      return {
        hours: 42,
        change: "+4.2h from last week",
        streakDays: 14,
        rank: "PLATINUM",
        nextMilestone: "Advanced Algorithm Design",
      };
    },
  });
};

export const useGoalsQuery = () => {
  const queryClient = useQueryClient();

  const query = useQuery<Goal[]>({
    queryKey: ["dashboard", "goals"],
    queryFn: async () => {
      await delay(900);
      // Retrieve from localStorage to preserve edits during interactions
      const cached = localStorage.getItem("momentum-mock-goals");
      if (cached) return JSON.parse(cached);

      const initialGoals: Goal[] = [
        {
          id: "1",
          title: "Discrete Math Set #4",
          category: "ACADEMIC",
          desc: "Complexity Analysis & Probability Theorems. Requires 3 Focus blocks.",
          est: "2.5H",
          completed: false,
        },
        {
          id: "2",
          title: "AI Ethics Case Study",
          category: "RESEARCH",
          desc: "Reviewing foundational papers on bias in LLM architectures.",
          est: "DONE",
          completed: true,
        },
        {
          id: "3",
          title: "Momentum UI Kit",
          category: "PROJECT",
          desc: "Refining the 1px gradient borders and focus timer interaction patterns.",
          est: "4.0H",
          completed: false,
        },
      ];
      localStorage.setItem("momentum-mock-goals", JSON.stringify(initialGoals));
      return initialGoals;
    },
  });

  const toggleGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await delay(200);
      const cached = localStorage.getItem("momentum-mock-goals");
      if (cached) {
        const goals: Goal[] = JSON.parse(cached);
        const updated = goals.map((g) =>
          g.id === goalId ? { ...g, completed: !g.completed } : g
        );
        localStorage.setItem("momentum-mock-goals", JSON.stringify(updated));
        return updated;
      }
      return [];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["dashboard", "goals"], data);
    },
  });

  return {
    ...query,
    toggleGoal: toggleGoalMutation.mutate,
  };
};

export const useWeeklyProgressQuery = () => {
  return useQuery<WeeklyProgress[]>({
    queryKey: ["dashboard", "weeklyProgress"],
    queryFn: async () => {
      await delay(1100);
      return [
        { day: "Mon", hours: 4.2 },
        { day: "Tue", hours: 5.5 },
        { day: "Wed", hours: 3.5 },
        { day: "Thu", hours: 6.8 },
        { day: "Fri", hours: 5.2 },
        { day: "Sat", hours: 8.4 },
        { day: "Sun", hours: 2.1 },
      ];
    },
  });
};

export const useFriendsQuery = () => {
  return useQuery<Friend[]>({
    queryKey: ["dashboard", "friends"],
    queryFn: async () => {
      await delay(1300);
      return [
        {
          name: "Alex Rivera",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB91NFWIaMCvbYUVPi4yplez-GVhd66nVM9DoWgKcfOr2CjbLl8PsvcfqudMkja0XA5rxTfX0KLjlGWgehy-d8QkcvYmgdHSuWwuz_S-qfMx-M0FxeGjNtUSP5SbyVWH-WO-M4PinIA5Me9OMQqqBbdVUvqnzLhEoHdrdDpI44mVEx0mSDSgTs9g8uxQdCbU3JofTbI9yLq6Q_wPtYqhPSiHgGwOSNGOfsaXk4QgERxDa6oWp7sJt1x",
          status: "studying",
          time: "02:45:12",
        },
        {
          name: "Jordan Smith",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8pyoVHTraHjAB8rv_V0i2NlL5tHEZFh7_OPDrUVqmo5R60xjiIzdNB2alX2H6chdVy3fhXSHeldEWamGyRwCaZkM4SYa1wmlZV0IrsORdtcFUTLW6fFAqwLxWWtD2at5whXigZlN2TV0g4jTrpmuMTI1HgLB8AT0fnphEbTwFDSrWGQBpcn-7r1MIcTIJXonrYZ5uvoEGi5uDjlhFli-K-djfK4Udn_7k3jsGlY62XTUQXND3O8qH",
          status: "studying",
          time: "00:15:44",
        },
        {
          name: "Chen Wei",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBteODRgTKtkeLzQ6570oko5JYqwKxniF3V3KrR_RzPz-VWAzMqOrUF1eL0Nq2iJqW2ov75verDWmmtKzlphQt868NQ_coNWfsUkrEQWJ2lod4SJgvpVkS7P2-JsoXAjW_LTN-qd_JhQe8wAdoz-onEjHMs0eZn3IkZECwHXjPQved52MmQNkzPSKM08QlVRWMBUr1XdCAZQaziBLi5WG2HZaQtHzNem7tB5-zezkEo6dfJ0EK0XeUz",
          status: "studying",
          time: "01:22:09",
        },
      ];
    },
  });
};

export const useActivitiesQuery = () => {
  return useQuery<Activity[]>({
    queryKey: ["dashboard", "activities"],
    queryFn: async () => {
      await delay(1500);
      return [
        { id: "1", username: "Alex Rivera", action: "joined study room 'Quantum Physics II'", time: "2m ago" },
        { id: "2", username: "Jordan Smith", action: "started a 50m deep work block", time: "5m ago" },
        { id: "3", username: "Chen Wei", action: "completed a 25m focus sprint", time: "12m ago" },
      ];
    },
  });
};
