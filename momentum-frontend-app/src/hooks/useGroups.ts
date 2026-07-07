import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "../services/groups";
import type { GroupCreateRequest, GroupSettingsRequest } from "../services/groups";

export const useGroups = (groupId?: string) => {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsService.getGroups(),
  });

  const groupQuery = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupsService.getGroup(groupId!),
    enabled: !!groupId,
  });

  const onlineMembersQuery = useQuery({
    queryKey: ["group", groupId, "online"],
    queryFn: () => groupsService.getOnlineMembers(groupId!),
    enabled: !!groupId,
    refetchInterval: 10000, // Poll every 10s for presence fallback
  });

  const activityQuery = useQuery({
    queryKey: ["group", groupId, "activity"],
    queryFn: () => groupsService.getGroupActivity(groupId!),
    enabled: !!groupId,
  });

  const createGroupMutation = useMutation({
    mutationFn: (request: GroupCreateRequest) => groupsService.createGroup(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: (id: string) => groupsService.joinGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      }
    },
  });

  const approveMemberMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      groupsService.approveMember(id, userId),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      }
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      groupsService.removeMember(id, userId),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      }
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: GroupSettingsRequest }) =>
      groupsService.updateSettings(id, request),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      }
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => groupsService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  return {
    groups: groupsQuery.data,
    isLoadingGroups: groupsQuery.isLoading,
    groupsError: groupsQuery.error,

    group: groupQuery.data,
    isLoadingGroup: groupQuery.isLoading,
    groupError: groupQuery.error,

    onlineMembers: onlineMembersQuery.data,
    isLoadingOnlineMembers: onlineMembersQuery.isLoading,

    activity: activityQuery.data,
    isLoadingActivity: activityQuery.isLoading,

    createGroup: createGroupMutation.mutateAsync,
    isCreatingGroup: createGroupMutation.isPending,

    joinGroup: joinGroupMutation.mutateAsync,
    isJoiningGroup: joinGroupMutation.isPending,

    approveMember: approveMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    updateSettings: updateSettingsMutation.mutateAsync,
    deleteGroup: deleteGroupMutation.mutateAsync,
  };
};
