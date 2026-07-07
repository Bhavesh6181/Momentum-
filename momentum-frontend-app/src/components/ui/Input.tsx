import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const inputVariants = cva(
  "flex w-full rounded-xl bg-surface-container-low border border-white/5 px-4 py-3 text-[14px] font-sans text-on-surface placeholder:text-on-surface-variant/40 transition-colors duration-200 outline-none focus:border-primary focus:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "",
        error: "border-error focus:border-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
