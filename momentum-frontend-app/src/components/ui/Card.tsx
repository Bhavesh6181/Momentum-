import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  "rounded-xl p-6 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "primary-card-gradient",
        glass: "bg-surface/80 backdrop-blur-[24px] border border-white/12 shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card: React.FC<CardProps> = ({
  children,
  variant,
  className,
  ...props
}) => {
  return (
    <div className={cn(cardVariants({ variant, className }))} {...props}>
      {children}
    </div>
  );
};
