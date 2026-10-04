import { describe, it, expect } from "vitest";
import { blankState } from "../types";
import { rowTarget, effChoice, rowCourses, sections, compute, blockDone, rowKey, PROG, MIN } from "./requirements";
import type { PickRow, PoolRow, ElRow, FreeRow } from "../data/2026-27/types";

describe("rowTarget", () => {
  it("a plain course code is worth its credit hours", () => {
    expect(rowTarget("BSTH 101")).toBe(3);
    expect(rowTarget("CHRI 308")).toBe(9); // credit override
  });
  it("a pick row defaults to pick count times 3, or its own cr if given", () => {
    const row: PickRow = { pick: 2, of: ["ENGL 101", "ENGL 102", "ENGL 171"] };
    expect(rowTarget(row)).toBe(6);
    const withCr: PickRow = { pick: 1, of: ["A", "B"], cr: 9 };
    expect(rowTarget(withCr)).toBe(9);
  });
  it("a pool row is worth its own cr", () => {
    const row: PoolRow = { pool: ["MEDA 111", "MEDA 113"], label: "x", cr: 6 };
    expect(rowTarget(row)).toBe(6);
  });
  it("an elective slot is worth its own cr", () => {
    const row: ElRow = { el: "Free elective", cr: 12 };
    expect(rowTarget(row)).toBe(12);
  });
  it("a free-elective row is worth its own amount", () => {
    const row: FreeRow = { free: 45 };
    expect(rowTarget(row)).toBe(45);
  });
});

describe("effChoice", () => {
  const row: PickRow = { pick: 2, of: ["ENGL 101", "ENGL 102", "ENGL 171"] };

  it("auto-fills from marked courses up to the pick cap, in option order", () => {
    const state = blankState();
    state.status = { "ENGL 171": "d", "ENGL 101": "p" };
    expect(effChoice(row, "k", state)).toEqual(["ENGL 101", "ENGL 171"]);
  });

  it("stops auto-filling once the cap is reached", () => {
    const state = blankState();
    state.status = { "ENGL 101": "d", "ENGL 102": "d", "ENGL 171": "d" };
    expect(effChoice(row, "k", state)).toHaveLength(2);
  });

  it("keeps an explicit choice even if the course has no status yet", () => {
    const state = blankState();
    state.choice = { k: ["ENGL 102"] };
    expect(effChoice(row, "k", state)).toEqual(["ENGL 102"]);
  });

  it("an elective row only returns explicit choices, never auto-fills", () => {
    const elRow: ElRow = { el: "Elective", cr: 3 };
    const state = blankState();
    state.status = { "PSYC 360": "d" };
    expect(effChoice(elRow, "k", state)).toEqual([]);
  });
});

describe("rowCourses", () => {
  it("a free row never counts specific courses (it fills from leftovers instead)", () => {
    const state = blankState();
    expect(rowCourses({ free: 10 }, "k", state)).toEqual([]);
  });
  it("a plain course code row is just that one course", () => {
    const state = blankState();
    expect(rowCourses("BSTH 101", "k", state)).toEqual(["BSTH 101"]);
  });
});

describe("sections (using real 2026-27 data)", () => {
  it("is empty with no program chosen", () => {
    expect(sections(blankState())).toEqual([]);
  });

  it("includes the Major once a program is chosen", () => {
    const state = blankState();
    state.program = "bst";
    const secs = sections(state);
    expect(secs).toHaveLength(1);
    expect(secs[0].kind).toBe("Major");
    expect(secs[0].key).toBe("bst");
  });

  it("adds a Minor section when one is chosen", () => {
    const state = blankState();
    state.program = "bst";
    state.minor = "m-meda";
    const secs = sections(state);
    expect(secs.map((s) => s.kind)).toEqual(["Major", "Minor"]);
  });

  it("only adds a Concentration if it's actually offered by the chosen program", () => {
    const state = blankState();
    state.program = "bst"; // doesn't offer any concentration
    state.conc = "phil-apol"; // belongs to Philosophy, not Biblical Studies
    expect(sections(state).map((s) => s.kind)).toEqual(["Major"]);

    state.program = "phil";
    expect(sections(state).map((s) => s.kind)).toEqual(["Major", "Concentration"]);
  });
});

describe("compute", () => {
  it("sums credit hours by status", () => {
    const state = blankState();
    state.program = "bst";
    state.status = { "BSTH 101": "d", "BSTH 102": "d", "BSTH 201": "i", "BSTH 270": "p" };
    const c = compute(state);
    expect(c.done).toBe(6);
    expect(c.prog).toBe(3);
    expect(c.plan).toBe(3);
  });

  it("only counts 3000+-level done courses toward the upper-level total", () => {
    const state = blankState();
    state.program = "bst";
    state.status = { "BSTH 101": "d", "ENGL 301": "d" }; // ENGL 301 is 3000-level
    expect(compute(state).upper).toBe(3);
  });

  it("fills free-elective rows from done courses that don't belong to any other row, in block order", () => {
    const state = blankState();
    state.program = "bst"; // its Electives block is a single {free:45} row
    const bst = PROG.get("bst")!;
    const freeBlockIndex = bst.blocks.findIndex(([t]) => t === "Electives");
    // Mark some course that is not part of any required/pick/pool row in this program as done.
    state.status = { "MEDA 999": "d" } as Record<string, "d">;
    // MEDA 999 isn't real, so give it credit via a course that IS in the catalog instead:
    state.status = { "PSYC 360": "d" };
    const c = compute(state);
    const key = rowKey("bst", freeBlockIndex, 0);
    expect(c.freeFill[key]).toBe(3);
    expect(c.leftoverAny).toContain("PSYC 360");
  });
});

describe("blockDone", () => {
  it("never exceeds the block's own credit total", () => {
    const state = blankState();
    state.program = "bst";
    const bst = PROG.get("bst")!;
    const coreIndex = bst.blocks.findIndex(([t]) => t === "Core requirements");
    const [, coreCr, coreRows] = bst.blocks[coreIndex];
    // Mark every course named anywhere in the core block as done.
    const codes = coreRows.flatMap((r) => (typeof r === "string" ? [r] : "of" in r ? r.of : []));
    state.status = Object.fromEntries(codes.map((c) => [c, "d"]));
    const secs = sections(state);
    const s = secs[0];
    const b = { t: s.blocks[coreIndex].t, cr: s.blocks[coreIndex].cr, rows: s.blocks[coreIndex].rows };
    const C = compute(state);
    expect(blockDone(s, b, coreIndex, C, state)).toBeLessThanOrEqual(coreCr);
  });

  it("the minor's required block reaches its total once every row is satisfied", () => {
    const state = blankState();
    state.program = "bst";
    state.minor = "m-meda"; // Media Arts minor, 24 credit hours, no electives-with-unknown-codes
    const minor = MIN.get("m-meda")!;
    const codes = minor.rows.flatMap((r) => {
      if (typeof r === "string") return [r];
      if ("of" in r) return [r.of[0]]; // just take the first option of any pick
      return [];
    });
    state.status = Object.fromEntries(codes.map((c) => [c, "d"]));
    // The minor also has a generic 9-credit "MEDA 3000-level courses" elective slot with no
    // specific codes — mark 3 made-up 3000-level MEDA courses as explicit choices for it.
    const secs = sections(state);
    const minorSection = secs.find((s) => s.kind === "Minor")!;
    const electiveRowIndex = minor.rows.findIndex((r) => typeof r !== "string" && "el" in r);
    const key = rowKey(minorSection.key, 0, electiveRowIndex);
    state.choice[key] = ["MEDA 310", "MEDA 320", "MEDA 324"];
    state.status["MEDA 310"] = "d";
    state.status["MEDA 320"] = "d";
    state.status["MEDA 324"] = "d";
    const C = compute(state);
    const b = minorSection.blocks[0];
    expect(blockDone(minorSection, b, 0, C, state)).toBe(minor.total);
  });
});
