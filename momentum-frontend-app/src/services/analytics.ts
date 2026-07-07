import api from "../lib/axios";

export const analyticsService = {
  getWeeklyHours: async () => {
    const response = await api.get("/analytics/me/weekly-hours");
    return response.data?.data;
  },

  getMonthlyProgress: async () => {
    const response = await api.get("/analytics/me/monthly-progress");
    return response.data?.data;
  },

  getCategoryDistribution: async () => {
    const response = await api.get("/analytics/me/category-distribution");
    return response.data?.data;
  },

  getMostActiveMembers: async (groupId: string) => {
    const response = await api.get(`/analytics/groups/${groupId}/most-active`);
    return response.data?.data;
  },

  getProductiveHours: async (groupId: string) => {
    const response = await api.get(`/analytics/groups/${groupId}/productive-hours`);
    return response.data?.data;
  },

  getUserStats: async () => {
    const response = await api.get("/users/me/stats");
    return response.data?.data;
  },

  getGithubActivity: async (userId: string) => {
    const response = await api.get(`/github/${userId}/activity`);
    return response.data?.data;
  },

  syncGithubActivity: async (userId: string) => {
    const response = await api.post(`/github/sync/${userId}`);
    return response.data?.data;
  },
};
