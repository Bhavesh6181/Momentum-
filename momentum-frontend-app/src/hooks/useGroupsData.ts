import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../services/groupsApi";
import type { Group, GroupMember, GroupActivity, GroupChallenge } from "../services/groupsApi";

export type { Group, GroupMember, GroupActivity, GroupChallenge };

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMyGroupsQuery() {
  return useQuery({
    queryKey: ["groups", "mine"],
    queryFn: () => groupsApi.getMyGroups(),
    staleTime: 5_000,
  });
}

export function useDiscoverGroupsQuery() {
  return useQuery({
    queryKey: ["groups", "discover"],
    queryFn: () => groupsApi.getDiscoverGroups(),
    staleTime: 5_000,
  });
}

export function useGroupDetailQuery(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: async () => {
      const data = await groupsApi.getGroupDetail(groupId);
      if (!data) throw new Error("Group not found");
      return data;
    },
    enabled: !!groupId,
  });
}

export function useJoinGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      return groupsApi.joinGroupByCode(code);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useCreateGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; subject: string; privacy: "public" | "private"; description?: string }) => {
      return groupsApi.createGroup(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", "mine"] });
    },
  });
}
