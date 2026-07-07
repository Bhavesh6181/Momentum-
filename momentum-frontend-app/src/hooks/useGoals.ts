import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsService } from "../services/goals";
import type { GoalCreateRequest, ChallengeCreateRequest } from "../services/goals";

export const useGoals = (groupId?: string, challengeId?: string) => {
  const queryClient = useQueryClient();

  const personalGoalsQuery = useQuery({
    queryKey: ["goals", "personal"],
    queryFn: () => goalsService.getPersonalGoals(),
  });

  const groupGoalsQuery = useQuery({
    queryKey: ["goals", "group", groupId],
    queryFn: () => goalsService.getGroupGoals(groupId!),
    enabled: !!groupId,
  });

  const challengeLeaderboardQuery = useQuery({
    queryKey: ["challenge", challengeId, "leaderboard"],
    queryFn: () => goalsService.getChallengeLeaderboard(challengeId!),
    enabled: !!challengeId,
  });

  const createGoalMutation = useMutation({
    mutationFn: (request: GoalCreateRequest) => goalsService.createGoal(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", "personal"] });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["goals", "group", groupId] });
      }
    },
  });

  const updateGoalProgressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      goalsService.updateGoalProgress(id, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", "personal"] });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["goals", "group", groupId] });
      }
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: (request: ChallengeCreateRequest) => goalsService.createChallenge(groupId!, request),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      }
    },
  });

  const joinChallengeMutation = useMutation({
    mutationFn: (id: string) => goalsService.joinChallenge(id),
    onSuccess: () => {
      if (challengeId) {
        queryClient.invalidateQueries({ queryKey: ["challenge", challengeId, "leaderboard"] });
      }
    },
  });

  const updateChallengeProgressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      goalsService.updateChallengeProgress(id, progress),
    onSuccess: () => {
      if (challengeId) {
        queryClient.invalidateQueries({ queryKey: ["challenge", challengeId, "leaderboard"] });
      }
    },
  });

  return {
    personalGoals: personalGoalsQuery.data,
    isLoadingPersonalGoals: personalGoalsQuery.isLoading,

    groupGoals: groupGoalsQuery.data,
    isLoadingGroupGoals: groupGoalsQuery.isLoading,

    challengeLeaderboard: challengeLeaderboardQuery.data,
    isLoadingChallengeLeaderboard: challengeLeaderboardQuery.isLoading,

    createGoal: createGoalMutation.mutateAsync,
    isCreatingGoal: createGoalMutation.isPending,

    updateGoalProgress: updateGoalProgressMutation.mutateAsync,
    isUpdatingGoalProgress: updateGoalProgressMutation.isPending,

    createChallenge: createChallengeMutation.mutateAsync,
    joinChallenge: joinChallengeMutation.mutateAsync,
    updateChallengeProgress: updateChallengeProgressMutation.mutateAsync,
  };
};
