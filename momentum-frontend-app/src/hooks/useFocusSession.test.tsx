import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFocusSession } from "./useFocusSession";
import { sessionsService } from "../services/sessions";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the sessions service
vi.mock("../services/sessions", () => ({
  sessionsService: {
    getActiveSession: vi.fn(),
  },
}));

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

describe("useFocusSession Hook Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("should initialize with study mode and tick countdown", async () => {
    vi.mocked(sessionsService.getActiveSession).mockResolvedValue(null);

    const { result } = renderHook(() => useFocusSession("study"), {
      wrapper: createWrapper(),
    });

    expect(result.current.mode).toBe("study");
    expect(result.current.isActive).toBe(true);
    expect(result.current.secondsLeft).toBe(25 * 60);

    // Fast-forward by 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.secondsLeft).toBe(25 * 60 - 10);
    expect(result.current.progressRatio).toBeCloseTo(10 / (25 * 60));
  });

  it("should pause and resume timer correctly", async () => {
    vi.mocked(sessionsService.getActiveSession).mockResolvedValue(null);

    const { result } = renderHook(() => useFocusSession("study"), {
      wrapper: createWrapper(),
    });

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(25 * 60 - 5);

    // Pause
    act(() => {
      result.current.togglePlay();
    });
    expect(result.current.isActive).toBe(false);

    // Advance time while paused
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Should remain unchanged
    expect(result.current.secondsLeft).toBe(25 * 60 - 5);

    // Resume
    act(() => {
      result.current.togglePlay();
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(25 * 60 - 10);
  });

  it("should switch modes and reset accumulated times", async () => {
    vi.mocked(sessionsService.getActiveSession).mockResolvedValue(null);

    const { result } = renderHook(() => useFocusSession("study"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.switchMode("break");
    });

    expect(result.current.mode).toBe("break");
    expect(result.current.secondsLeft).toBe(5 * 60);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(5 * 60 - 5);
  });

  it("should restore timer from active session start time if loaded from server", async () => {
    // Mock active session starting 5 minutes (300 seconds) ago
    const fiveMinutesAgo = new Date(Date.now() - 300 * 1000).toISOString();
    vi.mocked(sessionsService.getActiveSession).mockResolvedValue({
      id: "mock-active-session-uuid",
      subject: "Quantum Physics II",
      startTime: fiveMinutesAgo,
      durationMinutes: 25,
      status: "ACTIVE",
    });

    const { result, rerender } = renderHook(() => useFocusSession("study"), {
      wrapper: createWrapper(),
    });

    // Wait for the query to resolve and trigger useEffect sync
    await act(async () => {
      await Promise.resolve();
    });

    // Rerender to ensure state updates propagate
    rerender();

    // Verify it is in study mode and seconds left has been offset by 300s (25 mins - 5 mins = 20 mins remaining)
    expect(result.current.mode).toBe("study");
    expect(result.current.isActive).toBe(true);
    expect(result.current.secondsLeft).toBe(20 * 60);
  });
});
