import React from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none uppercase tracking-widest text-[12px]",
  {
    variants: {
      variant: {
        primary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90 focus-visible:ring-primary shadow-[0_4px_14px_rgba(108,92,231,0.4)]",
        secondary: "bg-transparent border-[1.5px] border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 focus-visible:ring-primary",
        ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:ring-outline normal-case tracking-normal text-[14px] font-normal",
        danger: "bg-error-container/20 border border-error-container/30 text-error hover:bg-error-container/30 focus-visible:ring-error",
      },
      size: {
        sm: "px-4 py-2 text-[10px]",
        md: "px-10 py-4",
        lg: "px-12 py-5 text-[14px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  className,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
