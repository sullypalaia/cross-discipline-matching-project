import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Offline markup fixtures exercise parsing without depending on a changing website.
const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync("src/lib/faculty/directory.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports, URL });
const { parseFacultyDirectory, rankFaculty } = exports;
const html = `<table><tr><th>Area of Expertise</th><th>Name</th></tr>
<tr><td>Climate Change</td><td><a href="/faculty-experts/test-climate">Test Climate</a></td></tr>
<tr><td>Computer Science</td><td><a href="/faculty-experts/test-computing">Test Computing</a><a href="https://evil.example/faculty-experts/person">Wrong Host</a></td></tr>
<tr><td>Education</td><td><a href="/faculty-experts/test-computing">Test Computing</a></td></tr>
<tr><td>Music</td><td><a href="javascript:alert(1)">Unsafe</a></td></tr></table>`;
const experts = parseFacultyDirectory(html);
assert.equal(experts.length, 2);
assert.equal(experts[1].expertise.length, 2);
assert.equal(rankFaculty(experts, "sustainability")[0].name, "Test Climate");
assert.equal(rankFaculty(experts, "React website")[0].name, "Test Computing");
assert.equal(rankFaculty(experts, "unrelated pottery").length, 0);
assert.equal(parseFacultyDirectory("<html>Directory unavailable</html>").length, 0);
assert(rankFaculty(experts, "climate computer education").every((person) => person.url.startsWith("https://ucm.calpoly.edu/faculty-experts/")));
console.log("PASS: directory parsing, duplicate faculty aggregation, official URL restrictions, topic synonyms, and empty results.");

const aiCode = ts.transpileModule(readFileSync("src/lib/faculty/recommendFaculty.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function ai(env = {}, fetcher = () => { throw new Error("Unexpected request"); }) {
  const loaded = {};
  vm.runInNewContext(aiCode, { exports: loaded, process: {env}, AbortSignal, fetch: fetcher,
    require: (name) => name === "server-only" ? {} : exports });
  return loaded.recommendFaculty;
}
const reply = (facultyIds) => ({ok:true,json:async()=>({status:"completed",output:[
  {type:"message",content:[{type:"output_text",text:JSON.stringify({rankings:facultyIds.map(id=>({id,reason:"This expertise relates to the project."}))})}]}],
})});
assert.equal((await ai()(experts,"sustainability")).fallbackReason,"no_key");
const env = {API_AI_KEY:"test-only"};
const chosen = experts[0].url;
const success = await ai(env,async()=>reply([chosen]))(experts,"sustainability");
assert.equal(success.mode,"ai");
assert.equal(success.faculty[0].name, experts[0].name);
assert.equal(success.faculty[0].url, chosen);
assert.equal(success.faculty[0].reason,"This expertise relates to the project.");
const reversed = await ai(env,async()=>reply([experts[1].url,chosen]))(experts,"sustainability");
assert.equal(reversed.faculty[0].url,experts[1].url);
for (const ids of [["https://evil.example/person"],[chosen,chosen],[chosen,chosen,chosen,chosen]]) {
  assert.equal((await ai(env,async()=>reply(ids))(experts,"sustainability")).fallbackReason,"ai_unavailable");
}
assert.equal((await ai(env,async()=>{throw new Error("timeout")})(experts,"sustainability")).mode,"directory");
assert.equal((await ai(env,async()=>reply([]))(experts,"sustainability")).faculty.length,0);
console.log("PASS: AI faculty ranking, no-key fallback, timeout fallback, unknown/duplicate IDs, and empty AI results.");

const catalog = exports.parseFacultyCatalog(`<table><tr><td>Example, Alex (2025)<br/>Music</td><td>Assistant Professor</td></tr><tr><td>Other, Pat (2020)<br/>Electrical Engineering</td><td>Lecturer</td></tr></table>`);
assert.equal(catalog.length, 2);
assert.equal(rankFaculty(catalog, 'music')[0].name, 'Alex Example');
assert.equal(rankFaculty(catalog, 'electrical engineering')[0].evidence, 'department');
const webCode = ts.transpileModule(readFileSync('src/lib/faculty/searchFacultyWeb.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function web(fetcher, env = {API_AI_KEY:'test-only'}) {
  const loaded = {};
  vm.runInNewContext(webCode, {exports:loaded, process:{env}, URL, AbortSignal, fetch:fetcher,
    require: () => exports});
  return loaded;
}
const source = 'https://music.calpoly.edu/faculty/example';
const result = {name:'Alex Example', url:source, expertise:['Composition'], reason:'Composition relates to the soundtrack.', evidence:'research'};
function mockSearch(candidate = result) {
  let calls = 0;
  return async (_url, options) => {
    const body = JSON.parse(options.body);
    calls++;
    if (calls === 1) {
      assert.equal(body.tools[0].type,'web_search');
      assert.equal(body.tools[0].filters.allowed_domains[0],'calpoly.edu');
      assert.equal(body.tool_choice,'required');
      return {ok:true,json:async()=>({status:'completed',output:[
        {type:'web_search_call',action:{sources:[{url:source}]}},
        {type:'message',content:[{type:'output_text',text:'Alex Example teaches composition.'}]}]})};
    }
    return {ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[
      {type:'output_text',text:JSON.stringify({faculty:[candidate]})}]}]})};
  };
}
assert.equal((await web(mockSearch()).searchFacultyWeb('game music')).discovery,'web');
await assert.rejects(web(mockSearch({...result,url:'https://evil.example/person'})).searchFacultyWeb('music'));
await assert.rejects(web(mockSearch(),{}).searchFacultyWeb('music'));
assert.equal(web().officialFacultyUrl('https://calpoly.edu.evil.example/a'),null);
assert.equal(web().officialFacultyUrl('http://music.calpoly.edu/a'),null);
console.log('PASS: all-department catalog, required web search, grounded source validation, and missing key.');

