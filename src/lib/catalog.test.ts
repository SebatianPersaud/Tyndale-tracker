import { describe, it, expect } from "vitest";
import { elAllows } from "./catalog";
import type { ElRow } from "../data/2026-27/types";

describe("elAllows", () => {
  it("restricts to the subject(s) in an explicit hint", () => {
    const row: ElRow = { el: "Fine Arts elective", cr: 3, hint: "ARTM, MUSC or MEDA" };
    expect(elAllows(row, "ARTM 100")).toBe(true);
    expect(elAllows(row, "MUSC 101")).toBe(true);
    expect(elAllows(row, "BIOL 101")).toBe(false);
  });

  it("reads a subject + level band straight off the label", () => {
    const row: ElRow = { el: "PHIL 3000-level courses", cr: 6 };
    expect(elAllows(row, "PHIL 301")).toBe(true);
    expect(elAllows(row, "PHIL 201")).toBe(false);
    expect(elAllows(row, "ENGL 301")).toBe(false);
  });

  it("reads a subject + explicit number range off the label", () => {
    const row: ElRow = { el: "BSTH 310–349 (Bible)", cr: 3 };
    expect(elAllows(row, "BSTH 321")).toBe(true);
    expect(elAllows(row, "BSTH 360")).toBe(false);
  });

  it("excludes a specific code within an otherwise-allowed level band", () => {
    const row: ElRow = { el: "BSTH 4000-level course (not BSTH 450)", cr: 3 };
    expect(elAllows(row, "BSTH 497")).toBe(true);
    expect(elAllows(row, "BSTH 450")).toBe(false);
  });

  it("an explicit match overrides label parsing, and allows extra codes alongside a subject", () => {
    const row: ElRow = {
      el: "CHRI course, PSYC 211 or PSYC 212",
      cr: 6,
      match: { subjects: ["CHRI"], codes: ["PSYC 211", "PSYC 212"] },
    };
    expect(elAllows(row, "CHRI 203")).toBe(true);
    expect(elAllows(row, "PSYC 211")).toBe(true);
    expect(elAllows(row, "PSYC 213")).toBe(false);
  });

  it("leaves a genuinely open elective unrestricted", () => {
    const row: ElRow = { el: "Transfer courses", cr: 18 };
    expect(elAllows(row, "BIOL 101")).toBe(true);
    expect(elAllows(row, "ANYTHING 999")).toBe(true);
  });
});
