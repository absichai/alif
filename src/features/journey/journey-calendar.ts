import type { JourneyPlan, JourneyStep } from "./journey-types";

function escapeText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function foldLine(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function formatStamp(date: Date): string {
  return `${date.toISOString().slice(0, 19).replaceAll(/[-:]/g, "")}Z`;
}

export function upcomingSteps(plan: JourneyPlan): JourneyStep[] {
  return plan.stepIds.flatMap((id) => {
    const step = plan.stepsById[id];
    return step && (step.state === "current" || step.state === "available")
      ? [step]
      : [];
  });
}

export function buildJourneyCalendar(
  plan: JourneyPlan,
  options: { start: Date; maxEvents?: number },
): string {
  const steps = upcomingSteps(plan).slice(0, options.maxEvents ?? 12);
  const weekMs = 7 * 24 * 60 * 60 * 1_000;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALIF//Dubai Journey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeText("ALIF · Your Dubai journey")}`),
  ];

  steps.forEach((step, index) => {
    const eventDate = new Date(options.start.getTime() + index * weekMs);
    lines.push(
      "BEGIN:VEVENT",
      foldLine(`UID:${step.id}@alif.journey`),
      `DTSTAMP:${formatStamp(options.start)}`,
      `DTSTART;VALUE=DATE:${formatDate(eventDate)}`,
      foldLine(`SUMMARY:${escapeText(`ALIF · ${step.title}`)}`),
      foldLine(
        `DESCRIPTION:${escapeText(
          `${step.summary} Why it matters: ${step.whyItMatters}${
            step.officialSource
              ? ` Official source: ${step.officialSource.url}`
              : ""
          }`,
        )}`,
      ),
    );
    if (step.officialSource) {
      lines.push(foldLine(`URL:${step.officialSource.url}`));
    }
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function nextMonday(from: Date): Date {
  const date = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const day = date.getUTCDay();
  const offset = day === 0 ? 1 : 8 - day;
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}
