export interface GroupMember {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  isOnline: boolean;
  focusTime?: string;
}

export interface GroupActivity {
  id: string;
  userName: string;
  userInitials: string;
  action: string;
  timeAgo: string;
}

export interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  targetHours: number;
  currentHours: number;
  daysLeft: number;
  participants: number;
  isJoined: boolean;
}

export interface Group {
  id: string;
  name: string;
  subject: string;
  memberCount: number;
  activeMembers: number;
  isAdmin: boolean;
  isJoined: boolean;
  privacy: "public" | "private";
  activityData: number[];
  activityTrend?: string;
  members: GroupMember[];
  description?: string;
  tags?: string[];
  weeklyHours?: number;
  streak?: number;
  inviteCode?: string;
  activities?: GroupActivity[];
  challenges?: GroupChallenge[];
}

// In-memory persistent arrays
const myGroups: Group[] = [
  {
    id: "1",
    name: "Quantum Physics II",
    subject: "Physics",
    memberCount: 3,
    activeMembers: 2,
    isAdmin: true,
    isJoined: true,
    privacy: "private",
    inviteCode: "QP2XZ4",
    activityData: [15, 18, 12, 16, 8, 14, 10, 12, 5, 8, 2],
    activityTrend: "+24% Spike",
    description: "Advanced quantum mechanics study group for final year physics majors.",
    tags: ["Physics", "Quantum", "Research"],
    weeklyHours: 24,
    streak: 14,
    members: [
      { id: "m1", name: "Priya Sharma", initials: "PS", isOnline: true, focusTime: "45 mins" },
      { id: "m2", name: "Alex Chen", initials: "AC", isOnline: true, focusTime: "1h 15m" },
      { id: "m3", name: "Ravi Kumar", initials: "RK", isOnline: false },
    ],
    activities: [
      { id: "a1", userName: "Priya Sharma", userInitials: "PS", action: "started a focus session in Study Room", timeAgo: "10 mins ago" },
      { id: "a2", userName: "Alex Chen", userInitials: "AC", action: "completed a 50m Pomodoro cycle", timeAgo: "1 hour ago" },
      { id: "a3", userName: "Ravi Kumar", userInitials: "RK", action: "joined the study group", timeAgo: "2 days ago" },
    ],
    challenges: [
      { id: "c1", title: "Quantum Mastery Marathon", description: "Study Quantum Mechanics for 50 collective hours this week.", targetHours: 50, currentHours: 24, daysLeft: 3, participants: 3, isJoined: true },
      { id: "c2", title: "Daily Streak Challenge", description: "Keep your daily study streak active for 14 days.", targetHours: 14, currentHours: 14, daysLeft: 0, participants: 2, isJoined: true },
    ],
  },
  {
    id: "2",
    name: "Advanced Algorithms Study Collective",
    subject: "Computer Science",
    memberCount: 2,
    activeMembers: 1,
    isAdmin: false,
    isJoined: true,
    privacy: "public",
    inviteCode: "ALG778",
    activityData: [10, 12, 5, 15, 8, 18, 12, 5],
    description: "Competitive programming and advanced data structures study group.",
    tags: ["DSA", "LeetCode", "Programming"],
    weeklyHours: 18,
    streak: 7,
    members: [
      { id: "m4", name: "Anjali Patel", initials: "AP", isOnline: true, focusTime: "30 mins" },
      { id: "m5", name: "Sam Wilson", initials: "SW", isOnline: false },
    ],
    activities: [
      { id: "a4", userName: "Anjali Patel", userInitials: "AP", action: "solved 3 LeetCode Medium questions", timeAgo: "30 mins ago" },
      { id: "a5", userName: "Sam Wilson", userInitials: "SW", action: "completed a 25m study block", timeAgo: "4 hours ago" },
    ],
    challenges: [
      { id: "c3", title: "100 LeetCode Problems", description: "Collectively solve 100 algorithm problems.", targetHours: 100, currentHours: 72, daysLeft: 8, participants: 2, isJoined: true },
    ],
  },
  {
    id: "3",
    name: "Dissertation Deep Focus",
    subject: "Research",
    memberCount: 2,
    activeMembers: 2,
    isAdmin: false,
    isJoined: true,
    privacy: "private",
    inviteCode: "DIS990",
    activityData: [5, 5, 6, 5, 5, 4],
    activityTrend: "High Consistency",
    description: "Dedicated workspace for PhD research and writing.",
    tags: ["Research", "PhD", "Writing"],
    weeklyHours: 35,
    streak: 21,
    members: [
      { id: "m6", name: "Dr. Mehta", initials: "DM", isOnline: true, focusTime: "2 hours" },
      { id: "m7", name: "Riya Shah", initials: "RS", isOnline: true, focusTime: "1 hour" },
    ],
    activities: [
      { id: "a6", userName: "Dr. Mehta", userInitials: "DM", action: "edited dissertation Chapter 4", timeAgo: "15 mins ago" },
      { id: "a7", userName: "Riya Shah", userInitials: "RS", action: "annotated 5 research papers", timeAgo: "1 hour ago" },
    ],
    challenges: [
      { id: "c4", title: "Chapter Sprint", description: "Write 5000 words this week.", targetHours: 5000, currentHours: 3200, daysLeft: 2, participants: 2, isJoined: true },
    ],
  },
];

const discoverGroups: Group[] = [
  {
    id: "d1",
    name: "Machine Learning Research",
    subject: "AI/ML",
    memberCount: 42,
    activeMembers: 17,
    isAdmin: false,
    isJoined: false,
    privacy: "public",
    inviteCode: "MLR112",
    activityData: [8, 12, 15, 20, 18, 22, 19, 24],
    activityTrend: "Trending",
    description: "Deep learning, Neural Networks, and AI paper reviews.",
    tags: ["ML", "Python", "Research"],
    weeklyHours: 28,
    streak: 30,
    members: [
      { id: "dm1", name: "Sarah Connor", initials: "SC", isOnline: true, focusTime: "50 mins" },
      { id: "dm2", name: "John Doe", initials: "JD", isOnline: false },
    ],
    activities: [
      { id: "da1", userName: "Sarah Connor", userInitials: "SC", action: "shared a PyTorch optimization notebook", timeAgo: "3 hours ago" },
    ],
    challenges: [
      { id: "dc1", title: "Paper Review Marathon", description: "Review 10 ML papers collectively.", targetHours: 10, currentHours: 4, daysLeft: 5, participants: 12, isJoined: false },
    ],
  },
  {
    id: "d2",
    name: "GATE 2026 Preparation",
    subject: "Engineering",
    memberCount: 128,
    activeMembers: 56,
    isAdmin: false,
    isJoined: false,
    privacy: "public",
    inviteCode: "GAT202",
    activityData: [20, 22, 25, 28, 30, 32, 35, 40],
    activityTrend: "+18% this week",
    description: "Collaborative study room for GATE CS/IT preparation.",
    tags: ["GATE", "Engineering", "Exam"],
    weeklyHours: 40,
    streak: 45,
    members: [
      { id: "dm3", name: "Rahul Verma", initials: "RV", isOnline: true, focusTime: "2 hours" },
    ],
    activities: [
      { id: "da2", userName: "Rahul Verma", userInitials: "RV", action: "finished Mock Test 4", timeAgo: "1 hour ago" },
    ],
    challenges: [
      { id: "dc2", title: "Syllabus Sprint", description: "Solve 500 GATE previous year questions.", targetHours: 500, currentHours: 210, daysLeft: 12, participants: 45, isJoined: false },
    ],
  },
];

export const groupsApi = {
  getMyGroups: async (): Promise<Group[]> => {
    return [...myGroups];
  },

  getDiscoverGroups: async (): Promise<Group[]> => {
    return [...discoverGroups];
  },

  getGroupDetail: async (id: string): Promise<Group | null> => {
    const grp = myGroups.find((g) => g.id === id) || discoverGroups.find((g) => g.id === id);
    return grp ? { ...grp } : null;
  },

  createGroup: async (data: { name: string; subject: string; privacy: "public" | "private"; description?: string }): Promise<Group> => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGroup: Group = {
      id: `created-${Date.now()}`,
      name: data.name,
      subject: data.subject,
      memberCount: 1,
      activeMembers: 1,
      isAdmin: true,
      isJoined: true,
      privacy: data.privacy,
      inviteCode,
      activityData: [4, 8, 12, 6, 9],
      description: data.description || `Dedicated study group for ${data.subject}.`,
      tags: [data.subject],
      weeklyHours: 0,
      streak: 0,
      members: [
        { id: "m-current-user", name: "You", initials: "YO", isOnline: true, focusTime: "0 mins" },
      ],
      activities: [
        { id: `act-${Date.now()}`, userName: "You", userInitials: "YO", action: "created the study group", timeAgo: "Just now" },
      ],
      challenges: [
        { id: `chal-1-${Date.now()}`, title: "Inaugural Study Sprint", description: "Establish a baseline of 10 collective study hours.", targetHours: 10, currentHours: 0, daysLeft: 7, participants: 1, isJoined: true },
      ],
    };
    myGroups.push(newGroup);
    return newGroup;
  },

  joinGroupByCode: async (code: string): Promise<Group> => {
    const cleanCode = code.trim().toUpperCase();
    const grpIdx = discoverGroups.findIndex((g) => g.inviteCode === cleanCode);
    if (grpIdx !== -1) {
      const grp = discoverGroups[grpIdx];
      grp.isJoined = true;
      grp.memberCount += 1;
      grp.members.push({ id: "m-current-user", name: "You", initials: "YO", isOnline: true });
      grp.activities?.unshift({ id: `act-${Date.now()}`, userName: "You", userInitials: "YO", action: "joined the study group using invite code", timeAgo: "Just now" });
      
      discoverGroups.splice(grpIdx, 1);
      myGroups.push(grp);
      return grp;
    }

    const alreadyJoined = myGroups.find((g) => g.inviteCode === cleanCode);
    if (alreadyJoined) {
      return alreadyJoined;
    }

    const newGroup: Group = {
      id: `joined-${Date.now()}`,
      name: `Study Group ${cleanCode}`,
      subject: "General",
      memberCount: 5,
      activeMembers: 2,
      isAdmin: false,
      isJoined: true,
      privacy: "private",
      inviteCode: cleanCode,
      activityData: [8, 12, 10, 15],
      description: `Study circle joined via code ${cleanCode}.`,
      tags: ["General Study"],
      weeklyHours: 12,
      streak: 4,
      members: [
        { id: "m-current-user", name: "You", initials: "YO", isOnline: true },
        { id: "md1", name: "Aria Stark", initials: "AS", isOnline: true, focusTime: "20 mins" },
        { id: "md2", name: "Jon Snow", initials: "JS", isOnline: false },
      ],
      activities: [
        { id: `act-1-${Date.now()}`, userName: "You", userInitials: "YO", action: "joined the study group", timeAgo: "Just now" },
        { id: `act-2-${Date.now()}`, userName: "Aria Stark", userInitials: "AS", action: "completed a 25m Pomodoro", timeAgo: "2 hours ago" },
      ],
      challenges: [
        { id: `chal-join-${Date.now()}`, title: "Introductory Study block", description: "Log 5 hours collectively.", targetHours: 5, currentHours: 1, daysLeft: 4, participants: 2, isJoined: true },
      ],
    };
    myGroups.push(newGroup);
    return newGroup;
  },
};
