import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Card } from "../components/ui/Card";

export const OnboardingLayout: React.FC = () => {
  const location = useLocation();

  const steps = [
    { path: "/onboarding/college", label: "College" },
    { path: "/onboarding/goals", label: "Goals" },
    { path: "/onboarding/academic", label: "Academic" },
    { path: "/onboarding/social", label: "Social" },
    { path: "/onboarding/avatar", label: "Avatar" },
  ];

  const currentStepIndex = steps.findIndex((step) => location.pathname === step.path);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 select-none relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary-container/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-xl space-y-8 relative z-10">
        {/* Step Progress bar */}
        <div className="flex items-center justify-between px-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            return (
              <React.Fragment key={step.path}>
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full border flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-secondary-container border-secondary-container text-on-secondary"
                        : isActive
                        ? "bg-primary-container border-primary-container text-on-primary-container shadow-[0_0_10px_rgba(108,92,231,0.5)]"
                        : "bg-surface-container border-white/5 text-on-surface-variant"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-2 text-on-surface-variant">
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] transition-all duration-300 ${
                      idx < currentStepIndex ? "bg-secondary-container" : "bg-white/5"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Wizard step card */}
        <Card className="p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <Outlet />
        </Card>
      </div>
    </div>
  );
};
