// Isolated API checks using clearly labeled sample fixtures, never production data.
// Start Next.js first, then: node scripts/check-matching.mjs [http://localhost:3000]
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";
const profile = { skills: ["React"], interests: ["sustainability"], hoursPerWeek: 6 };
const project = (id, overrides = {}) => ({
  id, title: `Sample project ${id}`, description: "Build a campus website.",
  skillsNeeded: ["React"], hoursPerWeek: 4, ...overrides,
});
async function post(body, status = 200, raw = false) {
  const response = await fetch(`${base}/api/match`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: raw ? body : JSON.stringify(body),
  });
  assert.equal(response.status, status);
  const result = await response.json();
  if (status === 200) assert.equal(result.mode, "sample");
  else assert.equal(typeof result.error, "string");
  return result;
}
const projects = [project("a"), project("b"), project("c"), project("d"),
  project("too-busy", { hoursPerWeek: 10 })];
const result = await post({ profile, projects });
assert.deepEqual(result.matches.map((m) => m.projectId), ["a", "b", "c"]);
assert.equal(new Set(result.matches.map((m) => m.projectId)).size, result.matches.length);
assert(result.matches.every((m) => projects.some((p) => p.id === m.projectId) && m.reason.length));
assert.deepEqual(await post({ profile, projects }), result);
assert.deepEqual((await post({ profile, projects: [] })).matches, []);
assert.deepEqual((await post({ profile: { ...profile, skills: ["pottery"], interests: ["music"] }, projects })).matches, []);
assert.deepEqual((await post({ profile, projects: [project("busy", { hoursPerWeek: 7 })] })).matches, []);
const interestOnly = await post({ profile, projects: [project("green", {
  description: "Sustainability for students", skillsNeeded: ["writing"],
})] });
assert.equal(interestOnly.matches[0].projectId, "green");
assert.match(interestOnly.matches[0].reason, /sustainability/);
const normalized = await post({ profile: { ...profile, skills: [" react "] }, projects: [project("case")] });
assert.equal(normalized.matches[0].projectId, "case");
assert.deepEqual((await post({ profile: { ...profile, skills: ["pottery"], interests: ["art"] },
  projects: [project("boundary", { description: "Build a cart", skillsNeeded: [] })] })).matches, []);
for (const invalid of [null, {}, { ...profile, skills: [] }, { ...profile, interests: [" "] },
  { ...profile, hoursPerWeek: 0 }, { ...profile, hoursPerWeek: -1 },
  { ...profile, hoursPerWeek: 81 }, { ...profile, hoursPerWeek: "6" }]) {
  await post({ profile: invalid, projects }, 400);
}
await post({ profile, projects: [project("same"), project("same")] }, 400);
await post({ profile, projects: [project("bad", { skillsNeeded: "React" })] }, 400);
await post({ profile, projects: Array.from({ length: 201 }, (_, i) => project(String(i))) }, 400);
await post("{invalid", 400, true);
console.log("PASS: matching API validation, sample labeling, deterministic ranking, supplied/unique IDs, availability, interest boundaries, and empty results.");
