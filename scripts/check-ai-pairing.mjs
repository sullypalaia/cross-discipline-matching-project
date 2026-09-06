// Offline tests: mock only the provider transport; never use a real key or bill API calls.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(path, dependencies, environment = {}, fetcher = () => { throw new Error("Unexpected network call"); }) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, process: { env: environment }, AbortSignal, fetch: fetcher,
    require(name) {
      if (name === "server-only") return {};
      if (dependencies[name]) return dependencies[name];
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}
const rules = load("src/lib/ai/matchProjects.ts", {});
const profile = { skills: ["React"], interests: ["climate"], hoursPerWeek: 6 };
const projects = [{ id: "one", title: "Climate site", description: "A climate website", skillsNeeded: ["React"], hoursPerWeek: 4 },
  { id: "busy", title: "Bigger site", description: "Climate", skillsNeeded: ["React"], hoursPerWeek: 20 }];
const create = (env, fetcher) => load("src/lib/ai/recommendProjects.ts", { "./matchProjects": rules }, env, fetcher).recommendProjects;
const response = (matches) => ({ ok: true, json: async () => ({status: "completed", output: [
  { type: "message", content: [{type: "output_text", text: JSON.stringify({matches})}] },
]}) });
let result = await create({})(profile, projects);
assert.equal(result.mode, "manual");
assert.equal(result.fallbackReason, "no_key");
assert.equal(result.matches[0].projectId, "one");
const env = { API_AI_KEY: "test-only" };
assert.equal((await create({ OPENAI_API_KEY: "ignored-test-key" })(profile, projects)).fallbackReason, "no_key");
result = await create(env, async (url, init) => {
  assert.equal(url, "https://api.openai.com/v1/responses");
  const body = JSON.parse(init.body);
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, "json_schema");
  assert.equal(JSON.parse(body.input).projects.length, 1);
  return response([{projectId: "one", reason: "Your React skill fits this website."}]);
})(profile, projects);
assert.equal(result.mode, "ai");
assert.equal(result.matches.length, 1);
for (const matches of [
  [{projectId:"invented",reason:"Bad ID"}],
  [{projectId:"busy",reason:"Exceeds availability"}],
  [{projectId:"one",reason:"A"},{projectId:"one",reason:"Duplicate"}],
  [{projectId:"one",reason:""}],
  [{projectId:"one",reason:"x".repeat(501)}],
]) {
  result = await create(env, async () => response(matches))(profile, projects);
  assert.equal(result.mode, "manual");
  assert.equal(result.fallbackReason, "ai_unavailable");
}
for (const fetcher of [
  async () => ({ok:false}),
  async () => { throw new Error("timeout"); },
  async () => ({ok:true,json:async()=>({status:"incomplete",output:[]})}),
  async () => ({ok:true,json:async()=>({status:"completed",output:[]})}),
]) {
  result = await create(env, fetcher)(profile, projects);
  assert.equal(result.fallbackReason, "ai_unavailable");
}
assert.equal((await create(env, async () => response([]))(profile, projects)).mode, "ai");
assert.equal((await create(env)(profile, [])).matches.length, 0);
console.log("PASS: no-key rules, AI success, input projection, unique/supplied IDs, availability, refusal/incomplete output, failure fallback, and empty results.");
