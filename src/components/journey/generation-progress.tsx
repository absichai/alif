"use client";

import { Check } from "lucide-react";

const states = [
  "Understanding your starting point",
  "Matching the Dubai destination pack",
  "Ordering your first chapters",
];

export function GenerationProgress({ activeIndex }: { activeIndex: number }) {
  return (
    <ol aria-live="polite" className="space-y-4">
      {states.map((label, index) => (
        <li className="flex items-center gap-3" key={label}>
          <span
            aria-hidden="true"
            className={`grid size-9 place-items-center rounded-full font-bold ${
              index <= activeIndex
                ? "bg-[var(--journey)] text-white"
                : "border border-[var(--border)]"
            }`}
          >
            {index < activeIndex ? <Check size={17} /> : index + 1}
          </span>
          <span
            className={index <= activeIndex ? "font-bold" : "text-[var(--muted)]"}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
