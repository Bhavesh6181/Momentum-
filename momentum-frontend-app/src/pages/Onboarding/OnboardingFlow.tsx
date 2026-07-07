import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useOnboardingStore } from "../../store/onboardingStore";
import type { OnboardingAnswers } from "../../store/onboardingStore";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import { CollegeStep } from "./steps/CollegeStep";
import { BranchAndYearStep } from "./steps/BranchAndYearStep";
import { CareerGoalsStep } from "./steps/CareerGoalsStep";
import { SocialLinksStep } from "./steps/SocialLinksStep";
import { ProfilePictureStep } from "./steps/ProfilePictureStep";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5;
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Step slide-in/out variants ────────────────────────────────────────────────
// direction: 1 = forward (right→left), -1 = backward (left→right)
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const transition = { duration: 0.5, ease: EASE };

// ─── Completion Screen ─────────────────────────────────────────────────────────
const CompletionScreen: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => (
  <motion.div
    key="completion"
    className="flex flex-col items-center text-center max-w-xl"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: EASE }}
  >
    {/* Animated checkmark ring */}
    <motion.div
      className="w-24 h-24 rounded-full border-2 border-signal-green flex items-center justify-center mb-8"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
    >
      <motion.svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <motion.path
          d="M8 20l8 8 16-16"
          stroke="var(--signal-green)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />
      </motion.svg>
    </motion.div>

    <motion.h1
      className="font-extrabold tracking-[-0.04em] leading-[1.1] mb-4 text-on-surface"
      style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
    >
      You&apos;re ready to launch.
    </motion.h1>

    <motion.p
      className="text-[16px] leading-[1.6] text-on-surface-variant mb-10 max-w-md"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
    >
      Your profile is set. Time to join thousands of high-performers already building their momentum.
    </motion.p>

    <motion.button
      onClick={onLaunch}
      className="
        bg-primary-container text-on-primary-container
        px-12 py-5 rounded-full text-[20px] font-semibold
        hover:brightness-110 active:scale-95
        transition-all duration-300 shadow-xl shadow-primary-container/30
      "
      style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
      aria-label="Launch your Momentum dashboard"
    >
      Launch Dashboard →
    </motion.button>
  </motion.div>
);

// ─── Main Orchestrator ─────────────────────────────────────────────────────────
export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, setStep, resetOnboarding, answers } = useOnboardingStore();

  // direction: 1=forward, -1=backward (used by slide variants)
  const [direction, setDirection] = React.useState(1);

  // Fetch backend onboarding progress and resume
  useEffect(() => {
    const fetchProfileAndResume = async () => {
      try {
        const response = await api.get("/users/me");
        const userData = response.data?.data;
        if (userData && userData.profile) {
          const p = userData.profile;
          useOnboardingStore.setState({
            answers: {
              college: p.college || "",
              branch: p.branch || "",
              gradYear: p.graduationYear ? p.graduationYear.toString() : "",
              targetInstitution: p.targetCompany || "",
              targetPackage: p.targetPackage || "",
              github: p.githubLink || "",
              linkedin: p.linkedinLink || "",
              profilePictureDataUrl: p.profilePictureUrl || null,
            },
            currentStep: p.onboardingStep || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch onboarding profile progress:", error);
      }
    };
    fetchProfileAndResume();
  }, []);

  const saveStepProgress = async (step: number) => {
    const storeState = useOnboardingStore.getState();
    const currentAnswers = storeState.answers;
    let patchData: any = {};
    if (step === 0) {
      patchData = {
        college: currentAnswers.college,
        onboardingStep: 1,
      };
    } else if (step === 1) {
      patchData = {
        branch: currentAnswers.branch,
        graduationYear: parseInt(currentAnswers.gradYear) || null,
        onboardingStep: 2,
      };
    } else if (step === 2) {
      patchData = {
        targetCompany: currentAnswers.targetInstitution,
        targetPackage: currentAnswers.targetPackage,
        onboardingStep: 3,
      };
    } else if (step === 3) {
      patchData = {
        githubLink: currentAnswers.github,
        linkedinLink: currentAnswers.linkedin,
        onboardingStep: 4,
      };
    } else if (step === 4) {
      patchData = {
        onboardingStep: 5,
        onboardingCompleted: true,
      };
    }

    try {
      const res = await api.patch("/users/me", patchData);
      if (res.data?.data) {
        const u = res.data.data;
        useAuthStore.getState().updateUser({
          college: u.profile?.college || undefined,
          branch: u.profile?.branch || undefined,
          year: u.profile?.graduationYear?.toString() || undefined,
          avatarUrl: u.profile?.profilePictureUrl || undefined,
          onboardingCompleted: u.profile?.onboardingCompleted || false,
          onboardingStep: u.profile?.onboardingStep || 0,
        });
      }
    } catch (err) {
      console.error(`Error saving progress for step ${step}:`, err);
    }
  };

  const isComplete = currentStep >= TOTAL_STEPS;
  const progressPct = isComplete ? 100 : Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  const goNext = useCallback(async () => {
    await saveStepProgress(currentStep);
    setDirection(1);
    setStep(currentStep + 1);
  }, [currentStep, setStep]);

  const goBack = useCallback(() => {
    if (currentStep === 0) {
      navigate("/register");
      return;
    }
    setDirection(-1);
    setStep(currentStep - 1);
  }, [currentStep, setStep, navigate]);

  const handleLaunch = useCallback(() => {
    resetOnboarding();
    // Navigate to dashboard — falls back to "/" until dashboard is built
    navigate("/dashboard", { replace: true });
  }, [navigate, resetOnboarding]);

  const steps = [
    <CollegeStep onNext={goNext} onBack={goBack} />,
    <BranchAndYearStep onNext={goNext} onBack={goBack} />,
    <CareerGoalsStep onNext={goNext} onBack={goBack} />,
    <SocialLinksStep onNext={goNext} onBack={goBack} />,
    <ProfilePictureStep onNext={goNext} onBack={goBack} />,
  ];

  return (
    <div
      className="min-h-screen bg-background text-on-background flex flex-col selection:bg-primary-container selection:text-white"
      data-page="onboarding"
    >
      {/* ── Grain overlay ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 w-full z-50"
        aria-hidden="true"
        style={{ height: "2px", background: "rgba(255,255,255,0.05)" }}
      >
        <motion.div
          className="h-full bg-primary-container"
          style={{
            boxShadow: "0 0 15px rgba(108,92,231,0.5)",
          }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: EASE }}
          aria-label={`Onboarding progress: ${progressPct}%`}
        />
      </div>

      {/* ── Branding header ────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center px-[16px] md:px-[48px] py-8 z-10">
        <div className="text-[20px] font-bold tracking-[-0.01em] text-on-surface">Momentum</div>
        <div className="flex items-center gap-6">
          {!isComplete && (
            <div className="text-label-caps text-on-surface-variant tracking-[0.2em]">
              STEP {currentStep + 1} / {TOTAL_STEPS}
            </div>
          )}
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              navigate("/login");
            }}
            className="text-[12px] font-bold uppercase tracking-wider text-error hover:underline"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main step content ──────────────────────────────────────────────── */}
      <main
        className="flex-grow flex flex-col items-center justify-center px-[16px] md:px-[48px] py-12 overflow-hidden"
        id="main-content"
        aria-labelledby="step-heading"
      >
        {/* Ambient glow blobs */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-64 h-64 bg-tertiary-container/5 blur-[100px] rounded-full pointer-events-none"
        />

        <AnimatePresence mode="wait" custom={direction}>
          {isComplete ? (
            <CompletionScreen key="complete" onLaunch={handleLaunch} />
          ) : (
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="w-full flex justify-center"
            >
              {steps[currentStep]}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Step dots (desktop only) ───────────────────────────────────────── */}
      {!isComplete && (
        <div
          className="hidden md:flex justify-center gap-3 pb-8"
          role="tablist"
          aria-label="Onboarding steps"
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              role="tab"
              aria-selected={i === currentStep}
              aria-label={`Step ${i + 1}`}
              className="rounded-full transition-all duration-500 cursor-default"
              style={{
                width: i === currentStep ? "24px" : "8px",
                height: "8px",
                background:
                  i < currentStep
                    ? "var(--primary-container)"
                    : i === currentStep
                    ? "var(--primary)"
                    : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
