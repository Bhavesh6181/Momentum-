import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface OnboardingAnswers {
  college: string;
  branch: string;
  gradYear: string;
  targetInstitution: string;
  targetPackage: string;
  github: string;
  linkedin: string;
  profilePictureDataUrl: string | null;
}

interface OnboardingState {
  currentStep: number;           // 0-indexed (0–4)
  answers: OnboardingAnswers;
  setStep: (step: number) => void;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  resetOnboarding: () => void;
}

const defaultAnswers: OnboardingAnswers = {
  college: "",
  branch: "",
  gradYear: "",
  targetInstitution: "",
  targetPackage: "",
  github: "",
  linkedin: "",
  profilePictureDataUrl: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────────
// Uses sessionStorage so a page refresh mid-onboarding preserves progress,
// but closing the browser tab clears it (no stale onboarding state on next visit).
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: defaultAnswers,

      setStep: (step) => set({ currentStep: step }),

      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),

      resetOnboarding: () =>
        set({ currentStep: 0, answers: defaultAnswers }),
    }),
    {
      name: "momentum-onboarding",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
