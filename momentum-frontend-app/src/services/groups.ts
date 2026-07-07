import api from "../lib/axios";

export interface GroupCreateRequest {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
}

export interface GroupSettingsRequest {
  name?: string;
  description?: string;
  category?: string;
  isPrivate?: boolean;
}

export const groupsService = {
  getGroups: async () => {
    const response = await api.get("/groups");
    return response.data?.data;
  },

  getGroup: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data?.data;
  },

  createGroup: async (request: GroupCreateRequest) => {
    const response = await api.post("/groups", request);
    return response.data?.data;
  },

  joinGroup: async (groupId: string) => {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data?.data;
  },

  approveMember: async (groupId: string, userId: string) => {
    const response = await api.post(`/groups/${groupId}/members/${userId}/approve`);
    return response.data?.data;
  },

  removeMember: async (groupId: string, userId: string) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data?.data;
  },

  updateSettings: async (groupId: string, request: GroupSettingsRequest) => {
    const response = await api.put(`/groups/${groupId}/settings`, request);
    return response.data?.data;
  },

  deleteGroup: async (groupId: string) => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data?.data;
  },

  getOnlineMembers: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/online-members`);
    return response.data?.data;
  },

  getGroupActivity: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/activity`);
    return response.data?.data;
  },
};
