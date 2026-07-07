import React from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 selection:bg-primary-container/30 select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-container/10 via-transparent to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>
    </div>
  );
};
