export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--sand)] px-5">
      <div aria-live="polite" className="text-center" role="status">
        <span
          aria-hidden="true"
          className="mx-auto block size-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--journey)]"
        />
        <p className="mt-4 font-bold text-[var(--muted)]">
          ALIF is preparing your page…
        </p>
      </div>
    </main>
  );
}
