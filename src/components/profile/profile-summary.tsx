import {
  incomeLabels,
  residencyLabels,
  stageLabels,
} from "@/features/profile/profile-labels";
import type { RelocationProfile } from "@/features/profile/profile-schema";

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
    [
      "Planning to drive in Dubai",
      profile.preferences.wantsToDrive === undefined
        ? "Not decided"
        : profile.preferences.wantsToDrive
          ? "Yes"
          : "No",
    ],
    [
      "Home uses district cooling",
      profile.preferences.propertyRequiresDistrictCooling === undefined
        ? "Not known yet"
        : profile.preferences.propertyRequiresDistrictCooling
          ? "Yes"
          : "No",
    ],
    [
      "Moving with pets",
      profile.preferences.hasPets === undefined
        ? "Not decided"
        : profile.preferences.hasPets
          ? "Yes"
          : "No",
    ],
  ];

  return (
    <dl className="mt-8 grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div className="border-b border-[var(--border)] p-5 last:border-b-0 sm:odd:border-r" key={label}>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            {label}
          </dt>
          <dd className="mt-2 font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
