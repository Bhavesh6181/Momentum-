import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Gate check: If user hasn't completed onboarding and isn't on onboarding routes, redirect
  const isOnboardingPath = location.pathname.startsWith("/onboarding");
  const isProfileIncomplete = !user?.onboardingCompleted;

  if (isProfileIncomplete && !isOnboardingPath) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
