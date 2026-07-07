import React, { useState, useRef } from "react";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { useOnboardingStore } from "../../../store/onboardingStore";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

const SUGGESTIONS = ["Stanford University", "MIT", "IIT Bombay", "Oxford University", "Cambridge", "NIT Trichy"];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const CollegeStep: React.FC<Props> = ({ onNext, onBack }) => {
  const { answers, setAnswer } = useOnboardingStore();
  const [query, setQuery] = useState(answers.college);
  const [activePill, setActivePill] = useState<string | null>(answers.college || null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions by query
  const filtered = query
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS;

  const handlePillClick = (college: string) => {
    // Flash green → settle indigo (matches the mockup JS interaction)
    setActivePill(college);
    setQuery(college);
    setAnswer("college", college);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setAnswer("college", query.trim());
      onNext();
    }
  };

  const canContinue = query.trim().length > 0;

  return (
    <div className="w-full max-w-3xl">
      {/* Step label */}
      <span className="text-label-caps text-primary tracking-widest block mb-4 uppercase">
        Onboarding 01 / 05
      </span>

      {/* Headline */}
      <h1
        className="font-extrabold tracking-[-0.04em] leading-[1.1] mb-12 text-on-surface"
        style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
        id="step-heading"
      >
        Where are you studying?
      </h1>

      <div className="space-y-8">
        {/* Search Input */}
        <div className="relative group">
          <div
            className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-on-surface-variant transition-colors duration-300"
            style={{ transitionTimingFunction: EASE }}
          >
            <Search size={20} aria-hidden="true" />
          </div>
          <input
            ref={inputRef}
            id="college-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAnswer("college", e.target.value);
              setActivePill(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search for your university…"
            aria-label="University search"
            autoComplete="off"
            className="
              w-full bg-surface-container-low border border-white/[0.08] rounded-xl
              py-6 pl-16 pr-6
              text-[16px] leading-[1.6] text-on-surface
              placeholder:text-on-surface-variant/40
              focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30
              shadow-2xl transition-all duration-300
            "
            style={{ transitionTimingFunction: EASE }}
          />
          <div className="absolute inset-y-0 right-6 flex items-center text-on-surface-variant/30 text-xs font-mono tracking-tighter pointer-events-none">
            PRESS ENTER ↵
          </div>
        </div>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-label-caps text-on-surface-variant mr-2 uppercase">Suggestions</span>
          {filtered.map((college) => (
            <button
              key={college}
              onClick={() => handlePillClick(college)}
              aria-pressed={activePill === college}
              className="
                px-5 py-2.5 rounded-full text-[14px] text-on-surface-variant
                border border-white/[0.08] bg-surface-container-low
                transition-all duration-300
                hover:bg-primary-container hover:border-primary-container hover:text-white hover:-translate-y-0.5
                aria-pressed:bg-primary-container aria-pressed:border-primary-container aria-pressed:text-white
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container
              "
              style={{ transitionTimingFunction: EASE }}
            >
              {college}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-24 pt-8 border-t border-white/5 flex justify-between items-center">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-[14px]"
          aria-label="Go back"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform duration-300"
            style={{ transitionTimingFunction: EASE }}
            aria-hidden="true"
          />
          Back
        </button>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-on-surface-variant text-[10px] font-semibold tracking-widest uppercase">Estimated Time</span>
            <span className="text-on-surface font-mono text-[18px]">4 MIN LEFT</span>
          </div>
          <button
            onClick={() => {
              if (canContinue) {
                setAnswer("college", query.trim());
                onNext();
              }
            }}
            disabled={!canContinue}
            aria-label="Continue to next step"
            className="
              group flex items-center gap-3
              bg-primary-container text-on-primary-container
              px-8 py-4 rounded-xl text-[20px] font-semibold
              hover:brightness-110 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100
              transition-all duration-300 shadow-xl shadow-primary-container/20
            "
            style={{ transitionTimingFunction: EASE }}
          >
            Continue
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform duration-300"
              style={{ transitionTimingFunction: EASE }}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
