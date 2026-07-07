import React from "react";
import { Outlet } from "react-router-dom";

export const DashboardLayout: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-container/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        <Outlet />
      </div>
    </div>
  );
};
