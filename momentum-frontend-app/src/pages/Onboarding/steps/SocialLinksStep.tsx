import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Terminal, Link2, ShieldCheck } from "lucide-react";
import { useOnboardingStore } from "../../../store/onboardingStore";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

interface UrlFieldProps {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

const UrlField: React.FC<UrlFieldProps> = ({ id, label, Icon, placeholder, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-3">
        <label
          htmlFor={id}
          className={`text-label-caps flex items-center gap-2 uppercase tracking-widest transition-colors duration-200 ${
            focused ? "text-primary" : "text-on-surface"
          }`}
        >
          <Icon size={18} aria-hidden={true} />
          {label}
        </label>
        <span className="text-[14px] text-on-surface-variant/50">Optional</span>
      </div>
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="
          w-full h-14 px-5
          bg-surface-container-low border border-white/[0.08] rounded-lg
          text-[16px] text-on-surface
          placeholder:text-outline-variant
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
          transition-all duration-300
        "
        style={{ transitionTimingFunction: EASE }}
      />
    </div>
  );
};

export const SocialLinksStep: React.FC<Props> = ({ onNext, onBack }) => {
  const { answers, setAnswer } = useOnboardingStore();

  return (
    <div className="w-full max-w-2xl">
      {/* Step label */}
      <p className="text-label-caps text-primary uppercase tracking-widest mb-4">
        Onboarding 04 / 05
      </p>

      <header className="mb-12">
        <h1
          className="font-extrabold tracking-[-0.04em] leading-tight text-on-surface mb-4"
          style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          id="step-heading"
        >
          Connect your profiles
        </h1>
        <p className="text-[16px] leading-[1.6] text-on-surface-variant max-w-lg">
          Link your professional networks to showcase your achievements and collaborate with the Momentum community.
        </p>
      </header>

      <section className="space-y-[24px]" aria-label="Social profile links">
        <UrlField
          id="github"
          label="GitHub URL"
          Icon={Terminal}
          placeholder="https://github.com/username"
          value={answers.github}
          onChange={(val) => setAnswer("github", val)}
        />
        <UrlField
          id="linkedin"
          label="LinkedIn URL"
          Icon={Link2}
          placeholder="https://linkedin.com/in/username"
          value={answers.linkedin}
          onChange={(val) => setAnswer("linkedin", val)}
        />

        {/* Privacy note */}
        <div className="pt-4 flex items-start gap-3 text-on-surface-variant">
          <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[14px] leading-relaxed">
            Momentum only uses these links for your public profile. We never post on your behalf or share your private data.
          </p>
        </div>
      </section>

      {/* Footer Actions */}
      <footer className="mt-[80px] flex flex-col md:flex-row items-center justify-between gap-[24px]">
        <button
          onClick={onBack}
          className="w-full md:w-auto flex items-center justify-center gap-2 text-label-caps text-on-surface-variant hover:text-on-surface px-8 py-4 transition-colors duration-300 uppercase tracking-widest order-2 md:order-1"
          style={{ transitionTimingFunction: EASE }}
          aria-label="Go back to career goals"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Previous
        </button>

        <div className="flex flex-col md:flex-row w-full md:w-auto gap-3 order-1 md:order-2">
          <button
            onClick={onNext}
            className="text-label-caps text-on-surface-variant hover:text-on-surface px-8 py-4 transition-colors duration-300 uppercase tracking-widest"
            style={{ transitionTimingFunction: EASE }}
            aria-label="Skip social links and continue"
          >
            Skip for Now
          </button>
          <button
            onClick={onNext}
            className="
              group flex items-center justify-center gap-3
              bg-primary-container text-on-primary-container
              px-10 py-4 rounded-full text-[20px] font-semibold
              hover:brightness-110 active:scale-95
              transition-all duration-300
            "
            style={{ transitionTimingFunction: EASE }}
            aria-label="Continue to profile picture"
          >
            Continue
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-300"
              aria-hidden="true"
            />
          </button>
        </div>
      </footer>
    </div>
  );
};
