import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { DocumentStatusControl } from "@/components/documents/document-status-control";
import { NeonDocumentRepository } from "@/db/repositories/neon-document-repository";
import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { getDestinationPack } from "@/data/destinations/registry";
import {
  collectRequiredDocuments,
  mergeDocumentStatuses,
} from "@/features/documents/document-readiness";
import { getJourney } from "@/features/journey/journey-service";

export default async function DocumentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const journey = await getJourney(new NeonJourneyRepository(), userId, getDestinationPack());
  if (!journey) redirect("/start");

  const required = collectRequiredDocuments(journey.plan);
  const statuses = await new NeonDocumentRepository().listStatuses(userId);
  const documents = mergeDocumentStatuses(required, statuses);
  const readyCount = documents.filter((item) => item.status === "ready").length;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link className="font-bold text-[var(--oasis)]" href="/journey">
        ← Back to journey
      </Link>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--journey-text)]">
            Document readiness
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            Papers your journey will ask for
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
            These documents come from the steps in your personalized journey.
            Track what is ready so nothing surprises you at a counter. Exact
            requirements can vary — always confirm against the official source
            linked on each step.
          </p>
        </div>
        <p className="min-w-32 text-sm text-[var(--muted)]">
          <strong className="block text-2xl text-[var(--journey-text)]">
            {readyCount}/{documents.length}
          </strong>
          documents ready
        </p>
      </div>

      {documents.length === 0 ? (
        <p className="mt-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6 text-[var(--muted)]">
          Your current journey has no document-heavy steps yet. New chapters
          can add documents here.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {documents.map((document) => (
            <li
              className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6"
              key={document.key}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <h2 className="text-lg font-semibold">{document.label}</h2>
                  {document.note ? (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {document.note}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Needed for:{" "}
                    {document.neededFor
                      .map((step) => step.stepTitle)
                      .join(" · ")}
                  </p>
                </div>
                <DocumentStatusControl
                  documentKey={document.key}
                  documentLabel={document.label}
                  status={document.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
