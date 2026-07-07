import api from "../lib/axios";

export interface SessionStartRequest {
  category: string;
  isPomodoro: boolean;
}

export const sessionsService = {
  startSession: async (request: SessionStartRequest) => {
    const response = await api.post("/sessions/start", request);
    return response.data?.data;
  },

  endSession: async (sessionId: string) => {
    const response = await api.post(`/sessions/${sessionId}/end`);
    return response.data?.data;
  },

  getActiveSession: async () => {
    const response = await api.get("/sessions/active");
    return response.data?.data;
  },

  getSessionHistory: async () => {
    const response = await api.get("/sessions/history");
    return response.data?.data;
  },

  startPomodoro: async () => {
    const response = await api.post("/pomodoro/start");
    return response.data?.data;
  },

  completePomodoroCycle: async (id: string) => {
    const response = await api.post(`/pomodoro/${id}/complete-cycle`);
    return response.data?.data;
  },

  endPomodoro: async (id: string) => {
    const response = await api.post(`/pomodoro/${id}/end`);
    return response.data?.data;
  },

  getPomodoroHistory: async () => {
    const response = await api.get("/pomodoro/history");
    return response.data?.data;
  },
};
