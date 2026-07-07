import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  college?: string;
  branch?: string;
  year?: string;
  githubUsername?: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // Keep for backward compatibility with route guards & existing code
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem("momentum_refresh_token", refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
          isLoggedIn: true,
          isAuthenticated: true,
        });
      },
      logout: () => {
        localStorage.removeItem("momentum_refresh_token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
          isAuthenticated: false,
        });
      },
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("momentum_refresh_token", refreshToken);
        set({
          accessToken,
          refreshToken,
        });
      },
    }),
    {
      name: "momentum-auth-storage",
      // Persist ONLY isLoggedIn to satisfy the requirement
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
      }),
      // Custom merge ensures we read separate localStorage refresh tokens and support backward-compatible E2E mocks
      merge: (persistedState: any, currentState) => {
        const isLoggedIn = persistedState?.isLoggedIn ?? persistedState?.isAuthenticated ?? false;
        const refreshToken = localStorage.getItem("momentum_refresh_token") ?? persistedState?.refreshToken ?? null;
        return {
          ...currentState,
          isLoggedIn,
          isAuthenticated: isLoggedIn,
          refreshToken,
          accessToken: null, // Never persist access token
          user: persistedState?.user ?? null,
        };
      },
    }
  )
);
