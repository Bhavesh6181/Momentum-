import React from "react";
import { Card } from "../ui/Card";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto space-y-4 select-none">
      <div className="h-12 w-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant border border-white/5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-headline-md text-on-surface m-0">{title}</h3>
        <p className="text-body-sm text-on-surface-variant max-w-sm mt-2 leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </Card>
  );
};
