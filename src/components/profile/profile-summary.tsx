import type { RelocationProfile } from "@/features/profile/profile-schema";

const stageLabels = {
  exploring: "Exploring Dubai",
  preparing: "Preparing to move",
  arrived: "Already in Dubai",
} as const;

const residencyLabels = {
  employment: "Employment sponsorship",
  business_or_self: "Business or self-sponsorship",
  family_sponsored: "Family sponsorship",
  unknown: "Not sure yet",
} as const;

const incomeLabels = {
  under_10000: "Under AED 10,000",
  "10000_19999": "AED 10,000–19,999",
  "20000_34999": "AED 20,000–34,999",
  "35000_49999": "AED 35,000–49,999",
  "50000_plus": "AED 50,000+",
} as const;

export function ProfileSummary({ profile }: { profile: RelocationProfile }) {
  const household =
    profile.household.relationshipStatus === "single"
      ? profile.household.childrenCount > 0
        ? `Single, moving with ${profile.household.childrenCount} children`
        : "Single"
      : `Married, ${profile.household.childrenCount} ${
          profile.household.childrenCount === 1 ? "child" : "children"
        }`;

  const items = [
    ["Journey stage", stageLabels[profile.stage]],
    ["Move timeframe", profile.moveTimeframe],
    ["Household", household],
    ["Residency path", residencyLabels[profile.residencyPath]],
    ["Passport country", profile.passportCountry],
    [
      "Monthly household income",
      profile.incomeRange ? incomeLabels[profile.incomeRange] : "Not provided",
    ],
  ];

  return (
    <dl className="mt-8 grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div className="border-b border-[var(--border)] p-5 last:border-b-0 sm:odd:border-r" key={label}>
          <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
            {label}
          </dt>
          <dd className="mt-2 font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
