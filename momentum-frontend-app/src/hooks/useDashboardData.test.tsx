import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useCurrentSessionQuery,
  useStreakQuery,
  useGoalsQuery,
  useWeeklyProgressQuery,
  useFriendsQuery,
  useActivitiesQuery,
} from "./useDashboardData";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDashboardData Hook Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should fetch current session with delay", async () => {
    const { result } = renderHook(() => useCurrentSessionQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    // Wait for the query to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({
      isActive: true,
      seconds: 2538,
      category: "Quantum Physics II",
    });
  });

  it("should fetch streak performance stats", async () => {
    const { result } = renderHook(() => useStreakQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.rank).toBe("PLATINUM");
  });

  it("should initialize goals list in localStorage and toggle goal status", async () => {
    const { result, rerender } = renderHook(() => useGoalsQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    // Wait for initial resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.length).toBe(3);
    expect(result.current.data?.[0].completed).toBe(false);

    // Toggle the first goal
    await act(async () => {
      result.current.toggleGoal("1");
      // Wait for mutation delay
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    // Rerender and verify goals updated
    rerender();
    expect(result.current.data?.[0].completed).toBe(true);
  });

  it("should fetch weekly progress history", async () => {
    const { result } = renderHook(() => useWeeklyProgressQuery(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    });

    expect(result.current.data?.length).toBe(7);
    expect(result.current.data?.[5].day).toBe("Sat");
  });
});
