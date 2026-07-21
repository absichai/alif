import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--oasis)] text-white hover:bg-[#0d2d27]",
        variant === "secondary" &&
          "border-2 border-[var(--journey-text)] bg-white text-[var(--journey-text)] hover:bg-[#fff5f0]",
        variant === "ghost" && "bg-transparent text-[var(--ink)] hover:bg-black/5",
        className,
      )}
      {...props}
    />
  );
}
