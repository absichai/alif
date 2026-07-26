import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.05)]",
        className,
      )}
      {...props}
    />
  );
}
