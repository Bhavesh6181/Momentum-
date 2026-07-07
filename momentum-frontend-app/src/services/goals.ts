import api from "../lib/axios";

export interface GoalCreateRequest {
  title: string;
  targetValue: number;
  category: string;
  groupId?: string;
}

export interface ChallengeCreateRequest {
  title: string;
  description: string;
  targetHours: number;
  startDate: string;
  endDate: string;
}

export const goalsService = {
  createGoal: async (request: GoalCreateRequest) => {
    const response = await api.post("/goals", request);
    return response.data?.data;
  },

  updateGoalProgress: async (goalId: string, progress: number) => {
    const response = await api.put(`/goals/${goalId}/progress?progress=${progress}`);
    return response.data?.data;
  },

  getPersonalGoals: async () => {
    const response = await api.get("/goals/me");
    return response.data?.data;
  },

  getGroupGoals: async (groupId: string) => {
    const response = await api.get(`/goals/group/${groupId}`);
    return response.data?.data;
  },

  createChallenge: async (groupId: string, request: ChallengeCreateRequest) => {
    const response = await api.post(`/groups/${groupId}/challenges`, request);
    return response.data?.data;
  },

  joinChallenge: async (challengeId: string) => {
    const response = await api.post(`/challenges/${challengeId}/join`);
    return response.data?.data;
  },

  updateChallengeProgress: async (challengeId: string, progress: number) => {
    const response = await api.put(`/challenges/${challengeId}/progress?progress=${progress}`);
    return response.data?.data;
  },

  getChallengeLeaderboard: async (challengeId: string) => {
    const response = await api.get(`/challenges/${challengeId}/leaderboard`);
    return response.data?.data;
  },
};
