import React from "react";
import { cn } from "../../lib/utils";

export interface PresenceDotProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "online" | "away" | "offline" | "studying";
}

export const PresenceDot: React.FC<PresenceDotProps> = ({
  status = "online",
  className,
  ...props
}) => {
  const statusColors = {
    online: "bg-signal-green",
    studying: "bg-secondary-fixed-dim",
    away: "bg-tertiary",
    offline: "bg-outline-variant",
  };

  const isPulseActive = status === "online" || status === "studying";

  return (
    <div className={cn("relative flex h-3 w-3 select-none", className)} {...props}>
      {isPulseActive && (
        <span className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-ring",
          statusColors[status]
        )} />
      )}
      <span className={cn("relative inline-flex rounded-full h-3 w-3", statusColors[status])} />
    </div>
  );
};
