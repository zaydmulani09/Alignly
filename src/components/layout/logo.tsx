import { cn } from "@/lib/cn";

/**
 * Two offset bars converging into alignment — the product's whole idea in a mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-7 text-primary"
        fill="none"
        strokeLinecap="round"
        strokeWidth="2.5"
        stroke="currentColor"
      >
        <path d="M4 6.5h9" />
        <path d="M4 12h16" className="text-secondary" stroke="currentColor" />
        <path d="M4 17.5h6" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">Alignly</span>
    </span>
  );
}
