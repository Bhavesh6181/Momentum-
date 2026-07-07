import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { sessionsService } from "../services/sessions";

export type FocusMode = "study" | "break";

const MODE_DURATIONS = {
  study: 25 * 60, // 25 minutes
  break: 5 * 60,  // 5 minutes
};

export const useFocusSession = (initialMode: FocusMode = "study") => {
  const [mode, setMode] = useState<FocusMode>(initialMode);
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // Total duration for current mode
  const totalSeconds = MODE_DURATIONS[mode];

  // Accumulated elapsed seconds before the current play span
  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(0);
  
  // System timestamp when the current play span started
  const [spanStartTime, setSpanStartTime] = useState<number | null>(Date.now());
  
  // Local state for UI updates
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);

  const { data: activeSession } = useQuery({
    queryKey: ["sessions", "active"],
    queryFn: () => sessionsService.getActiveSession(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Restore timer from server active session if available
  useEffect(() => {
    if (activeSession && activeSession.startTime) {
      const startMs = new Date(activeSession.startTime).getTime();
      const durationSec = (activeSession.durationMinutes || 25) * 60;
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      
      if (elapsed >= 0 && elapsed < durationSec) {
        setMode("study");
        setIsActive(true);
        setSpanStartTime(startMs);
        setAccumulatedSeconds(0);
        setSecondsLeft(durationSec - elapsed);
      }
    }
  }, [activeSession]);

  // Synchronize elapsed calculations
  const calculateSecondsLeft = useCallback(() => {
    if (!isActive || spanStartTime === null) {
      return totalSeconds - accumulatedSeconds;
    }
    const elapsedInCurrentSpan = Math.floor((Date.now() - spanStartTime) / 1000);
    const totalElapsed = accumulatedSeconds + elapsedInCurrentSpan;
    return Math.max(0, totalSeconds - totalElapsed);
  }, [isActive, spanStartTime, accumulatedSeconds, totalSeconds]);

  // Keep Ref to prevent stale closures in setInterval
  const calcRef = useRef(calculateSecondsLeft);
  useEffect(() => {
    calcRef.current = calculateSecondsLeft;
  }, [calculateSecondsLeft]);

  // Run the clock loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const left = calcRef.current();
      setSecondsLeft(left);

      // Auto-switch mode on completion
      if (left <= 0) {
        setIsActive(false);
        setMode((prev) => (prev === "study" ? "break" : "study"));
      }
    }, 100); // 100ms frequency keeps progress calculation fluid

    return () => clearInterval(interval);
  }, [isActive]);

  // Handle switching modes (Study <-> Break)
  const switchMode = useCallback((newMode: FocusMode) => {
    setMode(newMode);
    setAccumulatedSeconds(0);
    setSpanStartTime(isActive ? Date.now() : null);
    setSecondsLeft(MODE_DURATIONS[newMode]);
  }, [isActive]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setIsActive((prev) => {
      const nextActive = !prev;
      if (nextActive) {
        // Resuming: start a new span
        setSpanStartTime(Date.now());
      } else {
        // Pausing: save current span's elapsed time into accumulated
        if (spanStartTime !== null) {
          const currentElapsed = Math.floor((Date.now() - spanStartTime) / 1000);
          setAccumulatedSeconds((prevAcc) => prevAcc + currentElapsed);
        }
        setSpanStartTime(null);
      }
      return nextActive;
    });
  }, [spanStartTime]);

  // Reset current session
  const resetSession = useCallback(() => {
    setAccumulatedSeconds(0);
    setSpanStartTime(isActive ? Date.now() : null);
    setSecondsLeft(totalSeconds);
  }, [isActive, totalSeconds]);

  // Update browser tab title
  useEffect(() => {
    const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    const label = mode === "study" ? "Study" : "Break";
    document.title = `${mins}:${secs} — ${label} Mode`;

    // Restore page title on unmount
    return () => {
      document.title = "Momentum — Live Study Rooms & Accountability";
    };
  }, [secondsLeft, mode]);

  // Elapsed percentage for the progress ring
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  return {
    mode,
    isActive,
    secondsLeft,
    totalSeconds,
    progressRatio,
    togglePlay,
    resetSession,
    switchMode,
  };
};
