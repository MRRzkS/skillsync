"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Google sign-ins carry a profile photo in user_metadata; email/password
// sign-ups have none, so those fall back to the first letter of the name or
// email. Both render at the same size so layouts don't shift between them.
//
// Client component for the `onError` fallback only: Google's avatar URLs can
// expire or rate-limit, and a broken-image icon in the nav is worse than
// initials.
export default function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 32,
  className,
}: {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (avatarUrl && !imageFailed) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        onError={() => setImageFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  const initial = (name?.trim() || email?.trim() || "?").charAt(0).toUpperCase();

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground",
        className
      )}
    >
      {initial}
    </span>
  );
}
