import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6 shadow-[0_10px_30px_rgba(24,32,30,0.06)]",
        className,
      )}
      {...props}
    />
  );
}
