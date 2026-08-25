import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-text-dark placeholder:text-text-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sync-purple-600 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-300" : "border-ocean-100",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
