import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center", className)}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
            checked
              ? "border-sync-purple-600 bg-sync-purple-600"
              : "border-ocean-100 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-sync-purple-600"
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
