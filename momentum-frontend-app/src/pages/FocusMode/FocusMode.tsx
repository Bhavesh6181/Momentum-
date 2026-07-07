import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusSession } from "../../hooks/useFocusSession";
import {
  Play,
  Pause,
  X,
  Bolt,
  Timer as TimerIcon,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Pencil,
  Check,
} from "lucide-react";

const TOTAL_SESSIONS = 4;

export const FocusMode: React.FC = () => {
  const navigate = useNavigate();
  const {
    mode,
    isActive,
    secondsLeft,
    progressRatio,
    togglePlay,
    switchMode,
  } = useFocusSession("study");

  const [friendsStripVisible, setFriendsStripVisible] = useState(true);
  const [currentSession, setCurrentSession] = useState(1);
  const [sessionGoal, setSessionGoal] = useState("Finish Chapter 5");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(sessionGoal);
  const goalInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const secs = (totalSec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleEndSession = () => {
    navigate("/dashboard");
  };

  const handleGoalEdit = () => {
    setGoalInput(sessionGoal);
    setIsEditingGoal(true);
    setTimeout(() => goalInputRef.current?.focus(), 50);
  };

  const handleGoalSave = () => {
    setSessionGoal(goalInput.trim() || sessionGoal);
    setIsEditingGoal(false);
  };

  const percentDone = Math.round(progressRatio * 100);

  return (
    <div className="bg-background text-on-surface select-none overflow-hidden h-screen flex flex-col font-body-lg relative text-left">
      {/* Subtle ambient background — no noisy textures */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,92,231,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Side Navigation Bar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 flex-col py-margin-desktop bg-surface-container-low border-r border-outline-variant shadow-sm hidden md:flex">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <Bolt size={18} />
          </div>
          <div>
            <h2 className="font-bold text-headline-md text-secondary-fixed leading-none">Focus Mode</h2>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mt-1">Productive Session</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary-fixed font-bold border-r-2 border-secondary-fixed bg-surface-container-highest/40 transition-all">
            <TimerIcon size={20} />
            <span className="font-body-lg text-body-lg">Deep Work</span>
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-surface-container-highest transition-all hover:translate-x-1"
          >
            <BarChart3 size={20} />
            <span className="font-body-lg text-body-lg">Stats</span>
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-surface-container-highest transition-all hover:translate-x-1"
          >
            <Users size={20} />
            <span className="font-body-lg text-body-lg">Friends</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-surface-container-highest transition-all hover:translate-x-1">
            <BookOpen size={20} />
            <span className="font-body-lg text-body-lg">Resources</span>
          </button>
        </nav>

        <div className="px-2 mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-surface-container-highest transition-all">
            <Settings size={20} />
            <span className="font-body-lg text-body-lg">Settings</span>
          </button>
          <div className="mt-4 px-4">
            <button
              onClick={handleEndSession}
              className="w-full py-3 bg-error-container/20 border border-error-container/30 text-error hover:bg-error-container/30 rounded-lg text-label-caps font-label-caps font-bold transition-all duration-300"
            >
              Exit Focus
            </button>
          </div>
        </div>
      </aside>

      {/* Main Focus Clock Panel */}
      <main className="flex-1 flex flex-col items-center justify-center relative md:ml-64 p-margin-mobile md:p-margin-desktop bg-background z-10">
        {/* Timer Ambient Background Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            className="w-[600px] h-[600px] rounded-full animate-timer-breath"
            style={{
              filter: "blur(80px)",
              background: "radial-gradient(circle, rgba(108, 92, 231, 0.13) 0%, rgba(10, 10, 13, 0) 70%)",
            }}
          />
        </div>

        {/* Central Focus Timer Ring and Clock */}
        <div className="relative flex flex-col items-center text-center z-10">
          {/* Subject Label + Goal */}
          <div className="mb-6 flex flex-col items-center gap-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em] opacity-80">
              {mode === "study" ? "Quantum Physics II" : "Taking a Break"}
            </span>
            {mode === "study" && (
              <div className="flex items-center gap-1.5 mt-1">
                {isEditingGoal ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-on-surface-variant/60 uppercase tracking-wider">Goal:</span>
                    <input
                      ref={goalInputRef}
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleGoalSave(); if (e.key === "Escape") setIsEditingGoal(false); }}
                      className="bg-surface-container-high border border-white/10 rounded-md px-2 py-0.5 text-[12px] text-on-surface focus:outline-none focus:border-primary w-40"
                      maxLength={40}
                    />
                    <button onClick={handleGoalSave} className="text-signal-green hover:brightness-110">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoalEdit}
                    className="flex items-center gap-1.5 group text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                  >
                    <span className="text-[11px] uppercase tracking-wider">Goal:</span>
                    <span className="text-[12px] font-medium text-on-surface/80 group-hover:text-primary transition-colors">
                      {sessionGoal}
                    </span>
                    <Pencil size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SVG Progress Ring + Clock Timer */}
          <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 384">
              <circle
                cx="192"
                cy="192"
                r="180"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-white/5"
              />
              <circle
                id="progress-ring"
                cx="192"
                cy="192"
                r="180"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="1131"
                strokeDashoffset={1131 - progressRatio * 1131}
                className="text-[#00FF41] transition-all"
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  strokeLinecap: "round",
                  transition: isActive ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.35s ease-out",
                }}
              />
            </svg>

            {/* Timer Counter + Progress */}
            <div className="flex flex-col items-center gap-1">
              <h1 className="font-stats-md text-[64px] md:text-display-lg tabular-nums tracking-tighter text-on-surface drop-shadow-2xl font-bold">
                {formatTime(secondsLeft)}
              </h1>
              {/* Session progress indicator */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-on-surface-variant/60 font-medium uppercase tracking-wider">
                  Session {currentSession} / {TOTAL_SESSIONS}
                </span>
                <span className="text-on-surface-variant/30 text-xs">·</span>
                <span className="text-[11px] font-bold text-[#00FF41]/80">
                  {percentDone}%
                </span>
              </div>
              {/* Mini session pip indicators */}
              <div className="flex items-center gap-1.5 mt-2">
                {Array.from({ length: TOTAL_SESSIONS }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentSession(i + 1)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                      i < currentSession
                        ? "w-5 bg-[#00FF41]"
                        : i === currentSession - 1
                        ? "w-5 bg-primary"
                        : "w-3 bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-8 mt-12 px-8 py-4 bg-surface-container-lowest/50 rounded-full border border-white/5 backdrop-blur-md">
            <button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors group"
            >
              {isActive ? (
                <Pause size={24} className="group-hover:scale-110 transition-transform text-primary" />
              ) : (
                <Play size={24} className="group-hover:scale-110 transition-transform text-secondary-fixed-dim" />
              )}
            </button>

            {/* Mode Select slider */}
            <div
              onClick={() => switchMode(mode === "study" ? "break" : "study")}
              className="relative flex items-center p-1 bg-surface-container-high rounded-full w-44 h-10 overflow-hidden cursor-pointer"
            >
              <div
                style={{ transform: mode === "break" ? "translateX(82px)" : "translateX(0)" }}
                className="absolute left-1 w-[84px] h-8 bg-primary-container rounded-full transition-transform duration-500 ease-out-expo"
              />
              <div className="relative z-10 flex w-full justify-between text-[11px] font-label-caps uppercase px-4 font-bold">
                <span className={mode === "study" ? "text-on-primary-container" : "text-on-surface-variant"}>Studying</span>
                <span className={mode === "break" ? "text-on-primary-container" : "text-on-surface-variant"}>Break</span>
              </div>
            </div>

            <button
              onClick={handleEndSession}
              className="text-label-caps font-label-caps font-bold text-on-surface-variant hover:text-error transition-colors px-2"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Social Accountability Bottom Strip */}
        <div
          style={{ transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)" }}
          className={`
            absolute bottom-0 left-0 right-0 py-4 px-8 bg-surface-container-lowest/80 border-t border-outline-variant/30 backdrop-blur-xl flex items-center justify-between
            ${friendsStripVisible ? "translate-y-0" : "translate-y-full"}
          `}
        >
          <div className="flex items-center gap-6">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">
              Friends studying now
            </span>
            <div className="flex -space-x-3">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuC3dvAWLxfpvLT0atR7cBfc55vOMPefTcBrPJ67Q0brVjrd6pDRTtxITAxVnqCYP7pF55IX0NmfjsBgk8P4nLUoe7esVvlQyYBAPfuta1YOck9BftOkfbNmXNojkw8XH_hUtGHmjFednsOQKmEnVs80KtJ0fIuc5S-fSVWPNtjmSXcJMsLZQSEbm9inlqZDD4OrDaN2fjuVyV_ZFfWZd21XTVT_4sU3Fwxy3SlNeoHyZr6urk2po8BP",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDcC6hTD_b0PzI94GsxIgBdv_mQC_NkxSTkHOmjKE4sulGzEln-UqhnF4AHK8kIDnV-v6GFOIx2LG1sRJ884mvbE9gUvvuQXTpngDaMPRwmaxgT6NueBkyv1dy3J8MyccweGsljjC5140eA7-2hY85dqO5otv8SKXMnVFf0S5QLz-6JlZ5OpV7F_OvU4kxQZ-cdgF91BP8PTHaNcIsMNyv_D15X61yU5GdhHUXM6Wpht21THTNbIEdA",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAohglYzN-gSViEjJfBUtrgkvXtvbMLs6isDmNPZC83CHxdFP0tAGxxSh4aETcnKhTZIKfZdX18Q0pwt5SvmVwL8pgtSGYmD4wHlqEE4sxgtKZQQ8GcEv9TPRIW8fFYJXkmpeu6WSjt6d6stQtw9i8yu12TFMoSWukuaN-ViCm8uLSogrMfqUYSDzzpoibekr8HW91xKVDvr9-BniId06c7hod9u17w_GGZgoOI6lKQ8EutrSbugJlL",
              ].map((src, idx) => (
                <div key={idx} className="relative group">
                  <img className="w-8 h-8 rounded-full border-2 border-background object-cover" src={src} alt={`Avatar ${idx + 1}`} />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-secondary-fixed rounded-full border-2 border-background animate-pulse" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                +12
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] font-label-caps text-secondary-fixed">8,421 users currently</span>
              <span className="text-[10px] font-label-caps text-on-surface-variant">Momentum Worldwide</span>
            </div>
            <button onClick={() => setFriendsStripVisible(false)} className="text-on-surface-variant hover:text-on-surface">
              <X size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default FocusMode;
