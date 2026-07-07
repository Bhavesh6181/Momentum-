import { create } from "zustand";

interface FocusSession {
  id: string;
  category: string;
  startTime: string;
  isPomodoro: boolean;
}

interface SessionState {
  currentSession: FocusSession | null;
  isTimerRunning: boolean;
  timeRemaining: number; // in seconds
  studyCategory: string;
  activeGroupId: string | null;
  startSession: (session: FocusSession, duration: number) => void;
  endSession: () => void;
  setTimerRunning: (running: boolean) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  setStudyCategory: (category: string) => void;
  setActiveGroupId: (groupId: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: null,
  isTimerRunning: false,
  timeRemaining: 1500, // 25 minutes default
  studyCategory: "General Study",
  activeGroupId: null,
  startSession: (session, duration) =>
    set({
      currentSession: session,
      timeRemaining: duration,
      isTimerRunning: true,
      studyCategory: session.category,
    }),
  endSession: () =>
    set({
      currentSession: null,
      isTimerRunning: false,
    }),
  setTimerRunning: (running) => set({ isTimerRunning: running }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),
  setStudyCategory: (category) => set({ studyCategory: category }),
  setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),
}));
