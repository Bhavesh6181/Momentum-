import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider border select-none",
  {
    variants: {
      variant: {
        default: "bg-primary-container/10 text-primary border-primary/20",
        streak: "bg-secondary-container/10 text-secondary-fixed-dim border-secondary/20",
        error: "bg-error-container/10 text-error border-error/20",
        secondary: "bg-secondary-container/10 text-secondary border-secondary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  className,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {children}
    </span>
  );
};
