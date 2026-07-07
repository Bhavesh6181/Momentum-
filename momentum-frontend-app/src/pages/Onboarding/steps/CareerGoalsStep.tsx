import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { useOnboardingStore } from "../../../store/onboardingStore";

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const QUICK_TAGS = ["FAANG", "Startups", "Consulting", "Finance", "Research", "Government"];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const CareerGoalsStep: React.FC<Props> = ({ onNext, onBack }) => {
  const { answers, setAnswer } = useOnboardingStore();
  const [institutionFocused, setInstitutionFocused] = useState(false);
  const [packageFocused, setPackageFocused] = useState(false);

  const handleTagClick = (tag: string) => {
    setAnswer("targetInstitution", tag);
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Step label */}
      <p className="text-label-caps text-primary uppercase tracking-widest mb-4">
        Step 03 — Ambition · Onboarding 03 / 05
      </p>

      {/* Header */}
      <header className="mb-12 text-left">
        <h1
          className="font-extrabold tracking-[-0.04em] leading-tight text-on-surface"
          style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          id="step-heading"
        >
          Where are you headed?
        </h1>
        <p className="text-[16px] leading-[1.6] text-on-surface-variant mt-4 max-w-xl">
          Define your milestones. Momentum uses your targets to calibrate your study intensity and resource allocation.
        </p>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px]">
        {/* Target Institution Card */}
        <div
          className="md:col-span-7 p-8 rounded-xl transition-all duration-300"
          style={{
            background: "var(--surface-container-low)",
            border: institutionFocused
              ? "1px solid rgba(198,191,255,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: institutionFocused ? "0 0 0 1px rgba(198,191,255,0.1)" : "none",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Briefcase size={20} className="text-primary" aria-hidden="true" />
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-on-surface">Target Institution</h2>
          </div>
          <input
            type="text"
            value={answers.targetInstitution}
            onChange={(e) => setAnswer("targetInstitution", e.target.value)}
            onFocus={() => setInstitutionFocused(true)}
            onBlur={() => setInstitutionFocused(false)}
            placeholder="e.g. Goldman Sachs, SpaceX, or Stanford"
            aria-label="Target institution or company"
            className="
              w-full bg-surface-container-highest border border-white/10 rounded-lg
              px-4 py-4 text-[16px] text-on-surface
              placeholder:text-on-surface-variant/40
              focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
              transition-all duration-200
            "
          />
          {/* Quick Tags */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                aria-pressed={answers.targetInstitution === tag}
                className="
                  px-3 py-1 bg-surface-container-highest text-label-caps text-on-surface-variant
                  rounded-full border border-white/5 cursor-pointer
                  hover:border-primary/50 hover:text-primary
                  aria-pressed:bg-primary-container/20 aria-pressed:border-primary/50 aria-pressed:text-primary
                  transition-colors duration-200 text-[12px] font-semibold tracking-[0.05em] uppercase
                "
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Target Package Card */}
        <div
          className="md:col-span-5 p-8 rounded-xl transition-all duration-300"
          style={{
            background: "var(--surface-container-low)",
            border: packageFocused
              ? "1px solid rgba(198,191,255,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <DollarSign size={20} className="text-tertiary" aria-hidden="true" />
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-on-surface">Target Package</h2>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={answers.targetPackage}
              onChange={(e) => {
                // Numbers only
                const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                setAnswer("targetPackage", val);
              }}
              onFocus={() => setPackageFocused(true)}
              onBlur={() => setPackageFocused(false)}
              placeholder="0.00"
              aria-label="Target annual salary in USD"
              className="
                w-full bg-surface-container-highest border border-white/10 rounded-lg
                pl-4 pr-20 py-4 font-mono text-[18px] tabular-nums text-on-surface
                placeholder:text-on-surface-variant/40
                focus:outline-none focus:border-primary/50
                transition-all duration-200
              "
            />
            <span className="absolute right-4 text-[12px] font-semibold tracking-wider text-primary/60 uppercase">
              USD / YR
            </span>
          </div>
          <p className="mt-4 text-[14px] text-on-surface-variant/60 italic leading-[1.5]">
            Used for ROI benchmarking and motivation mapping.
          </p>
        </div>

        {/* Info banner + CTA */}
        <div
          className="md:col-span-12 mt-4 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "var(--surface-container-lowest)" }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
            <TrendingUp size={28} className="text-primary" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[20px] font-semibold tracking-[-0.01em] text-on-surface mb-1">Performance Precision</p>
            <p className="text-[14px] text-on-surface-variant leading-[1.5]">
              Your goals are private. Momentum uses this data to optimize your study roadmap based on historical placement benchmarks.
            </p>
          </div>
          <div className="ml-auto w-full md:w-auto shrink-0">
            <button
              onClick={onNext}
              aria-label="Continue to social links"
              className="
                group w-full md:w-auto flex items-center justify-center gap-2
                bg-primary-container text-on-primary-container
                px-8 py-4 rounded-full
                text-label-caps uppercase tracking-widest
                hover:brightness-110 active:scale-95
                transition-all duration-300
              "
              style={{ transitionTimingFunction: EASE }}
            >
              Continue Journey
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Back nav footer */}
      <footer className="mt-12 flex justify-between items-center px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-label-caps text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest"
          aria-label="Go back to branch and year"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Previous: Academic Focus
        </button>
        {/* Step dots */}
        <div className="hidden md:flex gap-4" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === 2 ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-surface-container-highest"
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
};
