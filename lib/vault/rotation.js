// "Change this password" reminders. Pure functions shared by the website, extension and mobile app.
//
// The reminder is opt-in. A client keeps a default period (days; 0 = off). An entry may override it
// with its own `rotateDays` (0 = never remind for this entry). Age is measured from
// `passwordChangedAt`, falling back to when the entry was created for older entries and backups.

export const DAY_MS = 24 * 60 * 60 * 1000;
export const SOON_DAYS = 14;

/** Options for pickers. `days: 0` means off/never. */
export const ROTATION_OPTIONS = [
  { days: 90, label: "3 months" },
  { days: 180, label: "6 months" },
  { days: 365, label: "12 months" },
];

export function periodLabel(days) {
  if (!days) return "Off";
  const known = ROTATION_OPTIONS.find((o) => o.days === days);
  if (known) return known.label;
  return days % 30 === 0 ? `${days / 30} months` : `${days} days`;
}

/** The period that applies to an entry: its own override, else the client default. 0 = none. */
export function effectivePeriod(entry, defaultDays = 0) {
  if (Number.isInteger(entry?.rotateDays)) return entry.rotateDays;
  return Number.isInteger(defaultDays) && defaultDays > 0 ? defaultDays : 0;
}

export function passwordChangedAt(entry, now = Date.now()) {
  return entry?.passwordChangedAt ?? entry?.createdAt ?? entry?.updatedAt ?? now;
}

/**
 * Status of one entry.
 * state: "off" (no reminder), "ok", "soon" (due within SOON_DAYS) or "due" (period reached).
 */
export function rotationStatus(entry, defaultDays = 0, now = Date.now()) {
  const ageDays = Math.max(0, Math.floor((now - passwordChangedAt(entry, now)) / DAY_MS));
  const period = effectivePeriod(entry, defaultDays);
  if (!period) return { state: "off", ageDays, period: 0, daysLeft: null, overdueDays: 0, due: false };

  const daysLeft = period - ageDays;
  const state = daysLeft <= 0 ? "due" : daysLeft <= SOON_DAYS ? "soon" : "ok";
  return { state, ageDays, period, daysLeft, overdueDays: Math.max(0, -daysLeft), due: daysLeft <= 0 };
}

/** Entries whose reminder has come due, most overdue first. Returns [{ entry, status }]. */
export function dueEntries(entries, defaultDays = 0, now = Date.now()) {
  return entries
    .map((entry) => ({ entry, status: rotationStatus(entry, defaultDays, now) }))
    .filter(({ status }) => status.due)
    .sort((a, b) => b.status.overdueDays - a.status.overdueDays);
}

/** "today", "5 days", "3 months", "1 year 2 months". */
export function formatAge(days) {
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 365) {
    const m = Math.floor(days / 30);
    return `${m} month${m === 1 ? "" : "s"}`;
  }
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  const years = `${y} year${y === 1 ? "" : "s"}`;
  return m ? `${years} ${m} month${m === 1 ? "" : "s"}` : years;
}

/** Short text for a badge, or "" when there is nothing to say. */
export function rotationLabel(status) {
  if (status.state === "off") return "";
  if (status.state === "due") {
    return status.overdueDays > 0 ? `Change due · ${formatAge(status.overdueDays)} overdue` : "Change due now";
  }
  if (status.state === "soon") return `Change in ${status.daysLeft} day${status.daysLeft === 1 ? "" : "s"}`;
  return "";
}
