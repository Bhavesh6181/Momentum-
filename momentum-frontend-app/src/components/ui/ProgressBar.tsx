import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number; // 0 to 100
  variant?: "thin" | "thick";
  color?: "indigo" | "green";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = "thin",
  color = "indigo",
  className,
  ...props
}) => {
  const rounded = "rounded-full";

  const heights = {
    thin: "h-[6px]",
    thick: "h-[12px]",
  };

  const colors = {
    indigo: "bg-primary-container",
    green: "bg-secondary-fixed-dim",
  };

  const clampProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "w-full bg-surface-container rounded-full overflow-hidden select-none",
        heights[variant],
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampProgress}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className={cn("h-full", colors[color], rounded)}
      />
    </div>
  );
};
