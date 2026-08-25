import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-structuresoft text-structure",
        outline: "border-line text-ink",
        attention: "border-transparent bg-attentionsoft text-attention",
        // SkillSync brand variants
        mint: "border-transparent bg-mint-50 text-mint-600",
        ai: "border-transparent bg-sync-purple-50 text-sync-purple-700",
        ocean: "border-transparent bg-ocean-50 text-ocean-700",
        "outline-soft": "border-ocean-100 bg-white text-ocean-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
