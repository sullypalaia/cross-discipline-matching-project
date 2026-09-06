import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const compile = path => ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const rules = {};
vm.runInNewContext(compile('src/lib/ai/skillRules.ts'),{exports:rules});
assert(rules.skillRules('Basketball','').includes('Coaching'));
assert(rules.skillRules('Garden website','').includes('Horticulture'));
assert(rules.skillRules('Garden website','').includes('Web development'));
assert.equal(rules.skillRules('Something','').length,3);
async function call(env, fetcher) {
  const route = {};
  vm.runInNewContext(compile('src/app/api/suggest-skills/route.ts'),{exports:route,require:()=>rules,process:{env},Response,AbortSignal,fetch:fetcher});
  return (await route.POST(new Request('http://localhost/api/suggest-skills',{method:'POST',body:JSON.stringify({title:'Basketball',description:'Organize a student team'})}))).json();
}
let called = false;
const noKey = await call({},()=>{called=true;throw Error('Must not call')});
assert.equal(called,false);
assert.equal(noKey.mode,'manual');
assert(noKey.skills.includes('Coaching'));
const failure = await call({API_AI_KEY:'test'},async()=>{throw Error('timeout')});
assert.equal(failure.mode,'manual');
const success = await call({API_AI_KEY:'test'},async()=>({ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:'{"skills":["Coaching"]}'}]}]})}));
assert.equal(success.mode,'ai');
console.log('PASS: no-key skips AI; request failure uses rules; AI success stays labeled AI; mixed and unknown topics supported.');
