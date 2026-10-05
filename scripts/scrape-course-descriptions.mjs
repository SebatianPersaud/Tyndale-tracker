// One-time(ish) scraper: pulls official course descriptions + prerequisites from
// tyndale.ca/course?code=<SUBJECT> for every subject in the catalog, and writes the raw
// extracted data to reference/courseDescriptions.json for review before it's folded into
// the typed data files. Run with: node scripts/scrape-course-descriptions.mjs
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const catalog = JSON.parse(readFileSync(path.join(ROOT, "reference/catalog.json"), "utf8"));
const subjects = [...new Set(catalog.map(([c]) => c.split(" ")[0]))].sort();

const HEADING_RE =
  /<h2 class="fs-1 fw-700 color-blue-400">([A-Z]+ [A-Z0-9-]+) &dash; (.*?) <span class="fs-0 fw-500">\((\d+) credit hours?\)<\/span><\/h2>\s*<div class="fs-18"><p>([\s\S]*?)<\/p>/g;
const PREREQ_RE = /\s*Prerequisites?:\s*([^.]*\.)\s*$/;

function stripTags(s) {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "’").trim();
}

async function fetchSubject(subject) {
  const courses = [];
  // Safety cap, not a real limit: an out-of-range page returns zero course headings,
  // which is the actual stop condition (verified: no redirect, no error, just empty).
  for (let page = 0; page < 20; page++) {
    const url = `https://www.tyndale.ca/course?code=${subject}&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    const html = await res.text();
    const matches = [...html.matchAll(HEADING_RE)];
    if (matches.length === 0) break;
    for (const m of matches) {
      const code = m[1].replace("&dash;", "-");
      const title = stripTags(m[2]);
      const credits = Number(m[3]);
      let description = stripTags(m[4]);
      const prereqMatch = description.match(PREREQ_RE);
      const prereq = prereqMatch ? prereqMatch[1].trim() : null;
      if (prereqMatch) description = description.slice(0, prereqMatch.index).trim();
      courses.push({ code, title, credits, description, prereq });
    }
  }
  return courses;
}

const all = [];
for (const subject of subjects) {
  process.stdout.write(`fetching ${subject}... `);
  const courses = await fetchSubject(subject);
  console.log(`${courses.length} courses`);
  all.push(...courses);
}

writeFileSync(path.join(ROOT, "reference/courseDescriptions.json"), JSON.stringify(all, null, 2));
console.log(`\nwrote reference/courseDescriptions.json (${all.length} courses)`);
