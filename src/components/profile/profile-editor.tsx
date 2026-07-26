"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  incomeLabels,
  residencyLabels,
  stageLabels,
} from "@/features/profile/profile-labels";
import {
  profilePatchSchema,
  type RelocationProfile,
} from "@/features/profile/profile-schema";

import { ProfileSummary } from "./profile-summary";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[#f8fafd] px-4 py-3";

type TriState = "unknown" | "yes" | "no";

function toTriState(value: boolean | undefined): TriState {
  if (value === undefined) return "unknown";
  return value ? "yes" : "no";
}

function fromTriState(value: FormDataEntryValue | null): boolean | undefined {
  if (value === "yes") return true;
  if (value === "no") return false;
  return undefined;
}

export function ProfileEditor({ profile }: { profile: RelocationProfile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const values = new FormData(event.currentTarget);
    const relationshipStatus = values.get("relationshipStatus");
    const incomeValue = values.get("incomeRange");
    // Start from the stored preferences so keys without a form control
    // (e.g. needsSchools from story extraction) survive an edit.
    const preferences: RelocationProfile["preferences"] = {
      ...profile.preferences,
    };
    const wantsToDrive = fromTriState(values.get("wantsToDrive"));
    if (wantsToDrive === undefined) delete preferences.wantsToDrive;
    else preferences.wantsToDrive = wantsToDrive;
    const cooling = fromTriState(values.get("propertyRequiresDistrictCooling"));
    if (cooling === undefined) delete preferences.propertyRequiresDistrictCooling;
    else preferences.propertyRequiresDistrictCooling = cooling;
    const hasPets = fromTriState(values.get("hasPets"));
    if (hasPets === undefined) delete preferences.hasPets;
    else preferences.hasPets = hasPets;

    const parsed = profilePatchSchema.safeParse({
      stage: values.get("stage"),
      moveTimeframe: values.get("moveTimeframe"),
      household: {
        relationshipStatus,
        childrenCount: Number(values.get("childrenCount")),
        movingTogether:
          relationshipStatus === "single"
            ? "not_applicable"
            : values.get("movingTogether"),
      },
      residencyPath: values.get("residencyPath"),
      passportCountry: values.get("passportCountry"),
      incomeRange: incomeValue ? incomeValue : null,
      preferences,
    });

    if (!parsed.success) {
      setError("Please review the highlighted answers and try again.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(
          body?.error?.message ?? "ALIF could not save those changes yet.",
        );
        return;
      }
      setEditing(false);
      setMessage(
        body?.updated
          ? "Journey updated. Completed steps stay completed."
          : "Everything already matched — nothing to change.",
      );
      router.refresh();
    } catch {
      setError("ALIF could not save those changes yet. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div>
        <ProfileSummary profile={profile} />
        {message ? (
          <p className="mt-4 font-bold text-[var(--success)]" role="status">
            {message}
          </p>
        ) : null}
        <Button
          className="mt-6"
          onClick={() => {
            setMessage(null);
            setEditing(true);
          }}
          type="button"
        >
          Edit profile and update journey
        </Button>
      </div>
    );
  }

  return (
    <form
      className="mt-8 grid gap-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6"
      onSubmit={submit}
    >
      <p className="text-sm leading-6 text-[var(--muted)]">
        When you save, ALIF rebuilds your journey from the updated details.
        Steps you already completed stay completed.
      </p>

      <label className="font-bold">
        Journey stage
        <select className={fieldClass} defaultValue={profile.stage} name="stage">
          {Object.entries(stageLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="font-bold">
        Move timeframe
        <input
          className={fieldClass}
          defaultValue={profile.moveTimeframe}
          maxLength={120}
          name="moveTimeframe"
          required
        />
      </label>

      <fieldset className="grid gap-4">
        <legend className="font-bold">Household</legend>
        <label>
          Relationship status
          <select
            className={fieldClass}
            defaultValue={profile.household.relationshipStatus}
            name="relationshipStatus"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
          </select>
        </label>
        <label>
          Number of children moving
          <input
            className={fieldClass}
            defaultValue={profile.household.childrenCount}
            max="12"
            min="0"
            name="childrenCount"
            required
            type="number"
          />
        </label>
        <label>
          If moving as a family, will everyone move together?
          <select
            className={fieldClass}
            defaultValue={
              profile.household.movingTogether === "not_applicable"
                ? "together"
                : profile.household.movingTogether
            }
            name="movingTogether"
          >
            <option value="together">Together</option>
            <option value="staggered">At different times</option>
          </select>
        </label>
      </fieldset>

      <label className="font-bold">
        Residency path
        <select
          className={fieldClass}
          defaultValue={profile.residencyPath}
          name="residencyPath"
        >
          {Object.entries(residencyLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="font-bold">
        Passport country
        <input
          className={fieldClass}
          defaultValue={profile.passportCountry}
          maxLength={80}
          minLength={2}
          name="passportCountry"
          required
        />
      </label>

      <label className="font-bold">
        Monthly household income (optional)
        <select
          className={fieldClass}
          defaultValue={profile.incomeRange ?? ""}
          name="incomeRange"
        >
          <option value="">Prefer not to say</option>
          {Object.entries(incomeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="grid gap-4">
        <legend className="font-bold">Life preferences</legend>
        <label>
          Planning to drive in Dubai?
          <select
            className={fieldClass}
            defaultValue={toTriState(profile.preferences.wantsToDrive)}
            name="wantsToDrive"
          >
            <option value="unknown">Not decided yet</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Will your home use district cooling?
          <select
            className={fieldClass}
            defaultValue={toTriState(
              profile.preferences.propertyRequiresDistrictCooling,
            )}
            name="propertyRequiresDistrictCooling"
          >
            <option value="unknown">Not known yet</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Moving with pets?
          <select
            className={fieldClass}
            defaultValue={toTriState(profile.preferences.hasPets)}
            name="hasPets"
          >
            <option value="unknown">Not decided yet</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </fieldset>

      {error ? (
        <p className="font-bold text-[var(--warning)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={saving} type="submit">
          {saving ? "Updating journey…" : "Save and update journey"}
        </Button>
        <Button
          disabled={saving}
          onClick={() => setEditing(false)}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
