import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--sand)] px-5">
      <div className="max-w-md text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
          Page not found
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          This street is not on the map.
        </h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--oasis)] px-6 font-extrabold text-white"
          href="/journey"
        >
          Back to your journey
        </Link>
      </div>
    </main>
  );
}
