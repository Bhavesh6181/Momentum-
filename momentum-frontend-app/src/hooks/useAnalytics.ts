import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics";

export const useAnalytics = (userId?: string, groupId?: string) => {
  const queryClient = useQueryClient();

  const weeklyHoursQuery = useQuery({
    queryKey: ["analytics", "weekly"],
    queryFn: () => analyticsService.getWeeklyHours(),
  });

  const monthlyProgressQuery = useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: () => analyticsService.getMonthlyProgress(),
  });

  const categoryDistributionQuery = useQuery({
    queryKey: ["analytics", "categories"],
    queryFn: () => analyticsService.getCategoryDistribution(),
  });

  const userStatsQuery = useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => analyticsService.getUserStats(),
  });

  const githubActivityQuery = useQuery({
    queryKey: ["github", "activity", userId],
    queryFn: () => analyticsService.getGithubActivity(userId!),
    enabled: !!userId,
  });

  const mostActiveMembersQuery = useQuery({
    queryKey: ["analytics", "group", groupId, "active-members"],
    queryFn: () => analyticsService.getMostActiveMembers(groupId!),
    enabled: !!groupId,
  });

  const productiveHoursQuery = useQuery({
    queryKey: ["analytics", "group", groupId, "productive-hours"],
    queryFn: () => analyticsService.getProductiveHours(groupId!),
    enabled: !!groupId,
  });

  const syncGithubMutation = useMutation({
    mutationFn: (id: string) => analyticsService.syncGithubActivity(id),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["github", "activity", userId] });
      }
    },
  });

  return {
    weeklyHours: weeklyHoursQuery.data,
    isLoadingWeeklyHours: weeklyHoursQuery.isLoading,

    monthlyProgress: monthlyProgressQuery.data,
    isLoadingMonthlyProgress: monthlyProgressQuery.isLoading,

    categoryDistribution: categoryDistributionQuery.data,
    isLoadingCategories: categoryDistributionQuery.isLoading,

    userStats: userStatsQuery.data,
    isLoadingUserStats: userStatsQuery.isLoading,

    githubActivity: githubActivityQuery.data,
    isLoadingGithub: githubActivityQuery.isLoading,

    mostActiveMembers: mostActiveMembersQuery.data,
    isLoadingMostActive: mostActiveMembersQuery.isLoading,

    productiveHours: productiveHoursQuery.data,
    isLoadingProductiveHours: productiveHoursQuery.isLoading,

    syncGithub: syncGithubMutation.mutateAsync,
    isSyncingGithub: syncGithubMutation.isPending,
  };
};
