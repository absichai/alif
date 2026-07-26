import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--journey)] text-white shadow-[0_1px_2px_rgba(16,24,40,0.10),0_8px_20px_rgba(46,107,255,0.25)] hover:bg-[var(--oasis)]",
        variant === "secondary" &&
          "border border-[var(--border)] bg-white text-[var(--ink)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:border-[var(--journey)] hover:text-[var(--journey-text)]",
        variant === "ghost" && "bg-transparent text-[var(--ink)] hover:bg-black/5",
        className,
      )}
      {...props}
    />
  );
}
