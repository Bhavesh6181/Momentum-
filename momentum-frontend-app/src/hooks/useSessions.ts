import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsService } from "../services/sessions";
import type { SessionStartRequest } from "../services/sessions";

export const useSessions = () => {
  const queryClient = useQueryClient();

  const activeSessionQuery = useQuery({
    queryKey: ["sessions", "active"],
    queryFn: () => sessionsService.getActiveSession(),
  });

  const sessionHistoryQuery = useQuery({
    queryKey: ["sessions", "history"],
    queryFn: () => sessionsService.getSessionHistory(),
  });

  const pomodoroHistoryQuery = useQuery({
    queryKey: ["pomodoro", "history"],
    queryFn: () => sessionsService.getPomodoroHistory(),
  });

  const startSessionMutation = useMutation({
    mutationFn: (request: SessionStartRequest) => sessionsService.startSession(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", "active"] });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsService.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", "active"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "history"] });
    },
  });

  const startPomodoroMutation = useMutation({
    mutationFn: () => sessionsService.startPomodoro(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "history"] });
    },
  });

  const completePomodoroCycleMutation = useMutation({
    mutationFn: (id: string) => sessionsService.completePomodoroCycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "history"] });
    },
  });

  const endPomodoroMutation = useMutation({
    mutationFn: (id: string) => sessionsService.endPomodoro(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "history"] });
    },
  });

  return {
    activeSession: activeSessionQuery.data,
    isLoadingActiveSession: activeSessionQuery.isLoading,

    sessionHistory: sessionHistoryQuery.data,
    isLoadingHistory: sessionHistoryQuery.isLoading,

    pomodoroHistory: pomodoroHistoryQuery.data,
    isLoadingPomodoroHistory: pomodoroHistoryQuery.isLoading,

    startSession: startSessionMutation.mutateAsync,
    isStartingSession: startSessionMutation.isPending,

    endSession: endSessionMutation.mutateAsync,
    isEndingSession: endSessionMutation.isPending,

    startPomodoro: startPomodoroMutation.mutateAsync,
    completePomodoroCycle: completePomodoroCycleMutation.mutateAsync,
    endPomodoro: endPomodoroMutation.mutateAsync,
  };
};
