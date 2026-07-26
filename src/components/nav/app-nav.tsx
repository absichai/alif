"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/journey", label: "Journey", exact: true },
  { href: "/journey/documents", label: "Documents", exact: false },
  { href: "/journey/budget", label: "Budget", exact: false },
  { href: "/profile", label: "Profile", exact: false },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex items-center gap-1 text-sm font-semibold">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href ||
            (pathname.startsWith("/journey/milestones") && link.href === "/journey")
          : pathname.startsWith(link.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={clsx(
              "rounded-full px-4 py-2 transition",
              active
                ? "bg-[#eaf0ff] text-[var(--journey-text)]"
                : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]",
            )}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
