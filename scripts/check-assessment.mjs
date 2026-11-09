import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the shipped state transitions, including revising earlier work.
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const module = {exports:{}};
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}
  }).outputText;
  const localRequire = spec => load(path.resolve(path.dirname(file), spec + (spec.endsWith('.json') ? '' : '.ts')));
  vm.runInNewContext(code, {module,exports:module.exports,require:localRequire}, {filename:file});
  return module.exports;
}
const logic=load(path.resolve('app/assessment-state.ts'));
const data=load(path.resolve('app/assessment-data.ts'));
const plain=x=>JSON.parse(JSON.stringify(x));
let s=logic.restoreCase(null);
assert.equal(logic.caseScore(s),0);
s=logic.answerDecision(s,'a');
assert.equal(s.decisionPassed,false);
s=logic.answerDecision(s,'b');
assert.equal(logic.caseScore(s),20);
assert.equal(logic.answerDecision(s,'b').decisionAttempts.length,2);
assert.equal(logic.stageReady({...s,stage:4}),false);
for(const o of data.SCENE_OBJECTS){s=logic.collectEvidence(s,o.id);s=logic.collectEvidence(s,o.id);}
assert.equal(s.collected.length,8);
assert.equal(logic.stageReady({...s,stage:4}),true);
const first=data.EVIDENCE_CARDS[0];
let result=logic.placeEvidence(s,first.id,first.category==='documents'?'people':'documents');
s=result.state;
assert.equal(result.correct,false);
assert.equal(logic.caseScore(s),20);
for(const c of data.EVIDENCE_CARDS){s=logic.placeEvidence(s,c.id,c.category).state;s=logic.placeEvidence(s,c.id,c.category).state;}
assert.equal(logic.caseScore(s),100);
assert.equal(logic.correctedCount(s),1);
assert.equal(logic.topicCount({...s,asked:['leading']}),0);
assert.equal(logic.topicCount({...s,asked:data.REQUIRED_TOPICS}),3);
assert.equal(logic.timelineIssue(data.EXPECTED_ORDER),null);
assert.ok(logic.timelineIssue([...data.EXPECTED_ORDER].reverse()));
assert.ok(logic.timelineIssue(Array(6).fill('release')));
s={...s,stage:7,furthest:10,completed:[1,2,3,4,5,6,7,8,9,10],timeline:[...data.EXPECTED_ORDER],timelineSaved:true,timelineChecked:true,whysSaved:true,treeSaved:true,treeChecked:true};
s=logic.moveTimeline(s,'release',0);
assert.equal(s.timeline[0],'release');
assert.equal(s.timeline[4],'handover');
assert.equal(new Set(s.timeline).size,6);
assert.equal(s.furthest,7);
assert.equal(s.timelineSaved,false);
assert.equal(s.whysSaved,false);
assert.equal(s.treeSaved,false);
assert.equal(s.completed.includes(7),false);
s=logic.moveTimeline(s,'release',-1);
assert.equal(s.timeline.filter(Boolean).length,5);
assert.ok(logic.timelineIssue(s.timeline));
let why=logic.restoreCase(null);
for(let i=0;i<5;i++)why=logic.saveWhy(why,i,{key:'own',text:'Версия '+i,path:'open',verify:'Проверка '+i});
assert.equal(why.whysSaved,true);
why.nodes=[{id:'why-0',title:'Импорт',parent:'incident',question:false,reason:'',evidence:''},{id:'manual',title:'Своё',parent:'why-0',question:false,reason:'',evidence:''}];
why=logic.saveWhy(why,1,{key:'own',text:'Новая версия',path:'open',verify:'Новая проверка'});
assert.equal(why.whysSaved,false);
assert.deepEqual(plain(why.whys.slice(2)),[null,null,null]);
assert.equal(why.nodes.length,1);
assert.equal(why.nodes[0].id,'manual');
assert.equal(why.nodes[0].parent,null);
const n=(id,parent,question=false)=>({id,title:id,parent,question,reason:'',evidence:''});
const nodes=[n('a','incident'),n('b','a'),n('c','b'),n('q','incident',true)];
assert.equal(logic.canAttach(nodes,'a','c'),false);
assert.equal(logic.canAttach(nodes,'a','a'),false);
assert.equal(logic.canAttach(nodes,'c','q'),false);
assert.equal(logic.canAttach(nodes,'c','incident'),true);
assert.equal(logic.treeIssues({...s,nodes:[n('a','incident'),n('b','incident')],gates:{}}).length,1);
assert.equal(logic.treeIssues({...s,nodes:[n('a','incident'),n('b','incident'),n('q','incident',true)],gates:{incident:'or'}}).length,0);
assert.ok(logic.treeIssues({...s,nodes:[n('a',null)],gates:{}}).length);
const restored=logic.restoreCase({...s,collected:['pump','pump','invalid'],timeline:['release','release','invalid'],nodes:[n('a','b'),n('b','a')]});
assert.deepEqual(plain(restored.collected),['pump']);
assert.deepEqual(plain(restored.timeline),['release',null,null,null,null,null]);
assert.equal(restored.timelineSaved,false);
assert.ok(restored.nodes.some(n=>n.parent===null));
console.log('Assessment checks passed: scoring, retries, stage gates, timeline revision, hypothesis cascade, tree cycles and restored progress.');
