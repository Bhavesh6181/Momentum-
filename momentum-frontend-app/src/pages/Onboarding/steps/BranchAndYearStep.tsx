import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useOnboardingStore } from "../../../store/onboardingStore";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

const BRANCHES = ["Computer Science", "Electrical", "Mechanical", "Civil", "Chemical", "Finance", "Economics", "Biology", "Physics", "Law", "Medicine", "Design"];
const GRAD_YEARS = ["2024", "2025", "2026", "2027", "2028", "2029"];

interface PillGroupProps {
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  ariaLabel: string;
}

const PillGroup: React.FC<PillGroupProps> = ({ options, selected, onSelect, ariaLabel }) => (
  <div className="flex flex-wrap gap-4" role="group" aria-label={ariaLabel}>
    {options.map((opt) => {
      const isActive = selected === opt;
      return (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          aria-pressed={isActive}
          className="
            px-8 py-4 rounded-full font-semibold text-[20px]
            border transition-all duration-300 active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-background
          "
          style={{
            transitionTimingFunction: EASE,
            background: isActive ? "var(--primary-container)" : "var(--surface-container)",
            borderColor: isActive ? "var(--primary-container)" : "rgba(255,255,255,0.08)",
            color: isActive ? "var(--on-primary-container)" : "var(--on-surface-variant)",
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const BranchAndYearStep: React.FC<Props> = ({ onNext, onBack }) => {
  const { answers, setAnswer } = useOnboardingStore();

  const canContinue = answers.branch.length > 0 && answers.gradYear.length > 0;

  return (
    <div className="w-full max-w-4xl">
      {/* Back nav */}
      <div
        onClick={onBack}
        className="mb-12 flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onBack()}
        aria-label="Go back to previous step"
      >
        <ArrowLeft
          size={18}
          className="text-primary group-hover:-translate-x-1 transition-transform duration-300"
          style={{ transitionTimingFunction: EASE }}
          aria-hidden="true"
        />
        <span className="text-label-caps uppercase tracking-widest text-on-surface-variant">Personal Info</span>
      </div>

      {/* Step label */}
      <span className="text-label-caps text-primary tracking-widest block mb-4 uppercase">
        Onboarding 02 / 05
      </span>

      {/* Headline */}
      <h1
        className="font-extrabold tracking-[-0.04em] leading-[1.1] mb-16 text-on-surface"
        style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
        id="step-heading"
      >
        What are you pursuing?
      </h1>

      <div className="space-y-16">
        {/* Branch Selection */}
        <section aria-labelledby="branch-label">
          <h2
            id="branch-label"
            className="text-label-caps text-on-surface-variant mb-6 uppercase tracking-widest"
          >
            Select Your Academic Branch
          </h2>
          <PillGroup
            options={BRANCHES}
            selected={answers.branch}
            onSelect={(val) => setAnswer("branch", val)}
            ariaLabel="Academic branch selector"
          />
        </section>

        {/* Graduation Year */}
        <section aria-labelledby="grad-label">
          <h2
            id="grad-label"
            className="text-label-caps text-on-surface-variant mb-6 uppercase tracking-widest"
          >
            Expected Graduation
          </h2>
          <PillGroup
            options={GRAD_YEARS}
            selected={answers.gradYear}
            onSelect={(val) => setAnswer("gradYear", val)}
            ariaLabel="Graduation year selector"
          />
        </section>
      </div>

      {/* Footer */}
      <div className="mt-24 flex items-center justify-between border-t border-white/5 pt-12">
        {/* Social proof strip */}
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {["B", "E", "M"].map((initial, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center bg-primary-container text-on-primary-container text-xs font-bold"
                aria-hidden="true"
              >
                {initial}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center bg-surface-container-high text-on-surface text-[10px] font-bold">
              +12k
            </div>
          </div>
          <p className="text-[14px] text-on-surface-variant hidden md:block">
            Join 12,400+ high-achievers this semester.
          </p>
        </div>

        <button
          onClick={() => canContinue && onNext()}
          disabled={!canContinue}
          aria-label="Continue to career goals"
          className="
            group flex items-center gap-3
            bg-primary-container text-on-primary-container
            px-10 py-5 rounded-xl text-[20px] font-semibold
            hover:brightness-110 active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-300 shadow-lg shadow-primary-container/20
          "
          style={{ transitionTimingFunction: EASE }}
        >
          Next Step
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform duration-300"
            style={{ transitionTimingFunction: EASE }}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
};
