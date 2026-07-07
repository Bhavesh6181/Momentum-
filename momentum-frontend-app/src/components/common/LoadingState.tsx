import React from "react";
import { Skeleton } from "../ui/Skeleton";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading content logs..." }) => {
  return (
    <div className="w-full max-w-xl mx-auto p-6 space-y-6 select-none text-left">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <p className="text-[12px] uppercase font-bold text-on-surface-variant tracking-wider m-0">
          {message}
        </p>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  );
};
