import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Synchronization Failure",
  message = "An error occurred while loading content logs.",
  onRetry,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-4 select-none border border-error-container/20 bg-error-container/5">
      <div className="h-12 w-12 rounded-xl bg-error-container/10 flex items-center justify-center text-error border border-error/20">
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
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-headline-md text-error m-0">{title}</h3>
        <p className="text-body-sm text-on-surface-variant max-w-sm mt-2 leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      )}
    </Card>
  );
};
