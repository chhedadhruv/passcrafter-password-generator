import { describe, it, expect } from "vitest";
import {
  DAY_MS,
  dueEntries,
  effectivePeriod,
  formatAge,
  passwordChangedAt,
  periodLabel,
  rotationLabel,
  rotationStatus,
} from "./rotation";
import { memoryStorage } from "./storage";
import { createVault } from "./vault";

const NOW = Date.UTC(2026, 10, 21);
const daysAgo = (n) => NOW - n * DAY_MS;

describe("effectivePeriod", () => {
  it("uses the entry override, else the default, else none", () => {
    expect(effectivePeriod({ rotateDays: 90 }, 365)).toBe(90);
    expect(effectivePeriod({}, 180)).toBe(180);
    expect(effectivePeriod({}, 0)).toBe(0);
    expect(effectivePeriod({}, undefined)).toBe(0);
  });
  it("treats rotateDays 0 as 'never', even with a default", () => {
    expect(effectivePeriod({ rotateDays: 0 }, 180)).toBe(0);
  });
});

describe("passwordChangedAt", () => {
  it("falls back to createdAt then updatedAt for older entries", () => {
    expect(passwordChangedAt({ passwordChangedAt: 5, createdAt: 9 })).toBe(5);
    expect(passwordChangedAt({ createdAt: 9, updatedAt: 12 })).toBe(9);
    expect(passwordChangedAt({ updatedAt: 12 })).toBe(12);
  });
});

describe("rotationStatus", () => {
  it("is off when there is no period", () => {
    const s = rotationStatus({ passwordChangedAt: daysAgo(1000) }, 0, NOW);
    expect(s.state).toBe("off");
    expect(s.due).toBe(false);
    expect(s.ageDays).toBe(1000);
  });
  it("is ok, soon, then due as the password ages", () => {
    const at = (d) => rotationStatus({ passwordChangedAt: daysAgo(d) }, 180, NOW);
    expect(at(10).state).toBe("ok");
    expect(at(165).state).toBe("ok"); // 15 days left: just outside the 14-day "soon" window
    expect(at(166).state).toBe("soon");
    expect(at(170).daysLeft).toBe(10);
    expect(at(180).state).toBe("due");
    expect(at(200).overdueDays).toBe(20);
  });
  it("lets an entry override the default", () => {
    expect(rotationStatus({ passwordChangedAt: daysAgo(100), rotateDays: 90 }, 365, NOW).state).toBe("due");
    expect(rotationStatus({ passwordChangedAt: daysAgo(500), rotateDays: 0 }, 90, NOW).state).toBe("off");
  });
  it("never reports a negative age for clock skew", () => {
    expect(rotationStatus({ passwordChangedAt: NOW + 5 * DAY_MS }, 90, NOW).ageDays).toBe(0);
  });
});

describe("dueEntries", () => {
  it("lists only due entries, most overdue first", () => {
    const entries = [
      { id: "a", passwordChangedAt: daysAgo(10) },
      { id: "b", passwordChangedAt: daysAgo(400) },
      { id: "c", passwordChangedAt: daysAgo(200) },
      { id: "d", passwordChangedAt: daysAgo(900), rotateDays: 0 },
    ];
    expect(dueEntries(entries, 180, NOW).map((x) => x.entry.id)).toEqual(["b", "c"]);
    expect(dueEntries(entries, 0, NOW)).toEqual([]);
  });
});

describe("labels", () => {
  it("formats ages", () => {
    expect(formatAge(0)).toBe("today");
    expect(formatAge(1)).toBe("1 day");
    expect(formatAge(12)).toBe("12 days");
    expect(formatAge(60)).toBe("2 months");
    expect(formatAge(365)).toBe("1 year");
    expect(formatAge(430)).toBe("1 year 2 months");
  });
  it("labels periods and badges", () => {
    expect(periodLabel(0)).toBe("Off");
    expect(periodLabel(180)).toBe("6 months");
    expect(periodLabel(60)).toBe("2 months");
    expect(periodLabel(45)).toBe("45 days");
    expect(rotationLabel({ state: "off" })).toBe("");
    expect(rotationLabel({ state: "ok" })).toBe("");
    expect(rotationLabel({ state: "soon", daysLeft: 1 })).toBe("Change in 1 day");
    expect(rotationLabel({ state: "due", overdueDays: 0 })).toBe("Change due now");
    expect(rotationLabel({ state: "due", overdueDays: 65 })).toBe("Change due · 2 months overdue");
  });
});

describe("vault integration: when does a password's age reset?", () => {
  const ITER = { iterations: 1000 };
  const fresh = async () => createVault(memoryStorage(), "correct horse battery", ITER);

  it("starts the age at creation for new entries", async () => {
    const s = await fresh();
    const e = await s.add({ label: "A", password: "pw1" }, { createdAt: 1000, updatedAt: 1000 });
    expect(e.passwordChangedAt).toBe(1000);
  });

  it("resets the age only when the password changes", async () => {
    const s = await fresh();
    const e = await s.add({ label: "A", password: "pw1" }, { createdAt: 1000, updatedAt: 1000 });
    const notesOnly = await s.update(e.id, { notes: "edited" });
    expect(notesOnly.passwordChangedAt).toBe(1000);
    const changed = await s.update(e.id, { password: "pw2" });
    expect(changed.passwordChangedAt).toBeGreaterThan(1000);
    expect(changed.createdAt).toBe(1000);
  });

  it("does not reset the age when the same password is saved again", async () => {
    const s = await fresh();
    const e = await s.add({ label: "A", password: "pw1" }, { createdAt: 1000, updatedAt: 1000 });
    expect((await s.update(e.id, { password: "pw1", label: "B" })).passwordChangedAt).toBe(1000);
  });

  it("stores, changes and clears a per-entry period", async () => {
    const s = await fresh();
    const e = await s.add({ label: "A", password: "pw1", rotateDays: 90 });
    expect(e.rotateDays).toBe(90);
    expect((await s.update(e.id, { rotateDays: 0 })).rotateDays).toBe(0);
    const cleared = await s.update(e.id, { rotateDays: undefined });
    expect("rotateDays" in cleared).toBe(false);
    expect((await s.list())[0].rotateDays).toBeUndefined();
  });

  it("keeps the period when other fields are edited (e.g. by the website form)", async () => {
    const s = await fresh();
    const e = await s.add({ label: "A", password: "pw1", rotateDays: 180 });
    const edited = await s.update(e.id, { label: "B", site: "x", username: "u", password: "pw1", notes: "" });
    expect(edited.rotateDays).toBe(180);
  });

  it("ignores invalid periods and dates", async () => {
    const s = await fresh();
    const e = await s.add({ label: "A", password: "p", rotateDays: -5, passwordChangedAt: "yesterday" });
    expect("rotateDays" in e).toBe(false);
    expect(typeof e.passwordChangedAt).toBe("number");
    expect("rotateDays" in (await s.add({ label: "B", password: "p", rotateDays: 99999 }))).toBe(false);
  });

  it("carries both fields through an encrypted backup", async () => {
    const a = await fresh();
    await a.add({ label: "A", password: "pw1", rotateDays: 90, passwordChangedAt: 4242 });
    const backup = JSON.parse(JSON.stringify(await a.exportBackup()));
    const b = await createVault(memoryStorage(), "another master pw", ITER);
    await b.importBackup(backup, "correct horse battery");
    const [got] = await b.list();
    expect(got.rotateDays).toBe(90);
    expect(got.passwordChangedAt).toBe(4242);
  });

  it("opens older entries that have neither field", async () => {
    const entry = { label: "Old", password: "x", createdAt: daysAgo(300), updatedAt: daysAgo(10) };
    expect(rotationStatus(entry, 180, NOW).ageDays).toBe(300);
    expect(rotationStatus(entry, 180, NOW).state).toBe("due");
  });
});
