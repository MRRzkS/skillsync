export function SkillSyncLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16.5 8.5C11 8.5 6.5 13 6.5 18.5C6.5 24 11 28.5 16.5 28.5C19.4 28.5 22 27.25 23.8 25.25"
        stroke="#1A5F7A"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M23.5 31.5C29 31.5 33.5 27 33.5 21.5C33.5 16 29 11.5 23.5 11.5C20.6 11.5 18 12.75 16.2 14.75"
        stroke="#7C5CFC"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
