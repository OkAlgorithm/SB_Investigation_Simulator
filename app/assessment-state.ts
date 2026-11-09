import {EVIDENCE_CARDS,EVENT_CARDS,EXPECTED_ORDER,REQUIRED_TOPICS,SCENE_OBJECTS,Category,QuestionId} from './assessment-data';

export type WhyAnswer={key:string;text:string;path:string;verify:string};
export type CauseNode={id:string;title:string;parent:string|null;evidence:string;reason:string;question:boolean};
export type CaseState={
 stage:number;furthest:number;completed:number[];startedAt:number|null;
 managerRead:boolean;decision:string|null;decisionAttempts:string[];decisionPassed:boolean;
 found:string[];studied:string[];collected:string[];peopleIntroduced:boolean;
 placements:Partial<Record<string,Category>>;classificationErrors:Record<string,number>;
 asked:QuestionId[];timeline:(string|null)[];timelineAttempts:number;timelineChecked:boolean;timelineSaved:boolean;
 whys:(WhyAnswer|null)[];whysSaved:boolean;nodes:CauseNode[];gates:Record<string,'and'|'or'>;treeChecked:boolean;treeSaved:boolean;
};
export const EMPTY_CASE:CaseState={stage:1,furthest:1,completed:[],startedAt:null,managerRead:false,decision:null,decisionAttempts:[],decisionPassed:false,found:[],studied:[],collected:[],peopleIntroduced:false,placements:{},classificationErrors:{},asked:[],timeline:Array(6).fill(null),timelineAttempts:0,timelineChecked:false,timelineSaved:false,whys:Array(5).fill(null),whysSaved:false,nodes:[],gates:{},treeChecked:false,treeSaved:false};
const uniq=<T,>(xs:T[])=>Array.from(new Set(xs));
export const classificationCount=(s:CaseState)=>EVIDENCE_CARDS.filter(c=>s.placements[c.id]===c.category).length;
export const topicCount=(s:CaseState)=>REQUIRED_TOPICS.filter(id=>s.asked.includes(id)).length;
export const caseScore=(s:CaseState)=>(s.decisionPassed?20:0)+classificationCount(s)*10;
export const correctedCount=(s:CaseState)=>Object.values(s.classificationErrors).reduce((a,b)=>a+b,0);
export function stageReady(s:CaseState,stage=s.stage){
 switch(stage){case 1:return true;case 2:return s.managerRead;case 3:return s.decisionPassed;case 4:return s.collected.length===SCENE_OBJECTS.length;case 5:return s.peopleIntroduced&&classificationCount(s)===EVIDENCE_CARDS.length;case 6:return topicCount(s)===3;case 7:return s.timelineSaved;case 8:return s.whysSaved&&s.whys.every(Boolean);case 9:return s.treeSaved;case 10:return true;default:return false}
}
export function finishStage(s:CaseState):CaseState{
 if(!stageReady(s))return s;
 const next=Math.min(10,s.stage+1);
 return {...s,stage:next,furthest:Math.max(s.furthest,next),completed:uniq([...s.completed,s.stage,...(next===10?[10]:[])]),startedAt:s.startedAt||Date.now()};
}
export function answerDecision(s:CaseState,choice:string):CaseState{
 if(!['a','b','v','g'].includes(choice)||s.decisionPassed)return s;
 return {...s,decision:choice,decisionAttempts:[...s.decisionAttempts,choice],decisionPassed:choice==='b'};
}
export function collectEvidence(s:CaseState,id:string):CaseState{
 if(!SCENE_OBJECTS.some(o=>o.id===id))return s;
 return {...s,found:uniq([...s.found,id]),studied:uniq([...s.studied,id]),collected:uniq([...s.collected,id])};
}
export function placeEvidence(s:CaseState,id:string,category:Category):{state:CaseState;correct:boolean;message:string}{
 const card=EVIDENCE_CARDS.find(c=>c.id===id);
 if(!card)return {state:s,correct:false,message:'Эта запись доступна как наблюдение в журнале.'};
 if(s.placements[id])return {state:s,correct:true,message:'Карточка уже распределена. Её можно открыть в категории.'};
 if(card.category!==category)return {state:{...s,classificationErrors:{...s.classificationErrors,[id]:(s.classificationErrors[id]||0)+1}},correct:false,message:'Попробуйте ещё раз. '+card.explanation};
 return {state:{...s,placements:{...s.placements,[id]:category}},correct:true,message:'Карточка размещена. +10 баллов. '+card.explanation};
}
export function moveTimeline(s:CaseState,id:string,target:number):CaseState{
 if(!EVENT_CARDS.some(e=>e.id===id)||!Number.isInteger(target)||target < -1||target>5)return s;
 const order=s.timeline.slice();const old=order.indexOf(id);
 if(old===target)return s;
 if(old>=0)order[old]=null;
 if(target>=0){const displaced=order[target];order[target]=id;if(displaced&&old>=0)order[old]=displaced;}
 return {...s,timeline:order,timelineChecked:false,timelineSaved:false,whysSaved:false,treeChecked:false,treeSaved:false,furthest:Math.min(s.furthest,7),completed:s.completed.filter(n=>n<7)};
}
export function timelineIssue(order:(string|null)[]):string|null{
 if(order.filter(Boolean).length!==6||new Set(order).size!==6)return 'Разместите шесть разных карточек на шкале.';
 const inversion=order.findIndex((id,i)=>i>0&&EXPECTED_ORDER.indexOf(order[i-1]!)>EXPECTED_ORDER.indexOf(id!));
 if(inversion>=0){const a=EVENT_CARDS.find(e=>e.id===order[inversion-1])?.title;const b=EVENT_CARDS.find(e=>e.id===order[inversion])?.title;return `Сверьте последовательность «${a}» и «${b}» в рабочей реконструкции.`;}
 return null;
}
export function saveWhy(s:CaseState,index:number,answer:WhyAnswer):CaseState{
 if(index<0||index>4||!answer.text.trim()||!answer.verify.trim()||(index>0&&!s.whys[index-1]))return s;
 const old=s.whys[index];const changed=!!old&&(old.text!==answer.text||old.path!==answer.path);
 const whys=s.whys.slice();if(changed)whys.fill(null,index+1);
 whys[index]={...answer,text:answer.text.trim().slice(0,1200),verify:answer.verify.trim().slice(0,2000)};
 const removed=new Set(changed?s.nodes.filter(n=>n.id.startsWith('why-')).map(n=>n.id):[]);
 const nodes=s.nodes.filter(n=>!removed.has(n.id)).map(n=>({...n,parent:n.parent&&removed.has(n.parent)?null:n.parent}));
 return {...s,whys,whysSaved:whys.every(Boolean),nodes,treeChecked:false,treeSaved:false,furthest:Math.min(s.furthest,8),completed:s.completed.filter(n=>n<8)};
}
export function canAttach(nodes:CauseNode[],id:string,parent:string|null):boolean{
 if(parent===null||parent==='')return true;
 if(parent==='incident')return true;
 const target=nodes.find(n=>n.id===parent);if(!target||target.question||parent===id)return false;
 const seen=new Set([id]);let p:string|null=parent;
 while(p&&p!=='incident'){if(seen.has(p))return false;seen.add(p);p=nodes.find(n=>n.id===p)?.parent||null;}
 return true;
}
export function isRooted(nodes:CauseNode[],id:string):boolean{
 const seen=new Set<string>();let p:string|null=id;
 while(p&&p!=='incident'){if(seen.has(p))return false;seen.add(p);p=nodes.find(n=>n.id===p)?.parent||null;}
 return p==='incident';
}
export function treeIssues(s:CaseState):string[]{
 const hypotheses=s.nodes.filter(n=>!n.question);const issues:string[]=[];
 if(!hypotheses.length)issues.push('Добавьте хотя бы одну гипотезу.');
 const loose=hypotheses.find(n=>!isRooted(s.nodes,n.id));if(loose)issues.push(`Свяжите карточку «${loose.title}» с исходным событием.`);
 const parents=['incident',...hypotheses.map(n=>n.id)];
 for(const p of parents){if(hypotheses.filter(n=>n.parent===p).length>=2&&!s.gates[p]){issues.push(`Выберите «И» или «ИЛИ» для ветви «${p==='incident'?'Выброс рабочей среды':s.nodes.find(n=>n.id===p)?.title}».`);break;}}
 return issues;
}
export function changeTree(s:CaseState,nodes:CauseNode[],gates=s.gates):CaseState{
 return {...s,nodes,gates,treeChecked:false,treeSaved:false,furthest:Math.min(s.furthest,9),completed:s.completed.filter(n=>n<9)};
}
export function deleteNode(s:CaseState,id:string):CaseState{
 const nodes=s.nodes.filter(n=>n.id!==id).map(n=>({...n,parent:n.parent===id?null:n.parent}));
 const gates={...s.gates};delete gates[id];return changeTree(s,nodes,gates);
}
export function restoreCase(value:unknown):CaseState{
 if(!value||typeof value!=='object')return {...EMPTY_CASE,timeline:Array(6).fill(null),whys:Array(5).fill(null)};
 const v=value as Partial<CaseState>;const validObjects=new Set(SCENE_OBJECTS.map(o=>o.id));
 const array=(xs:unknown,allowed:Set<string>)=>Array.isArray(xs)?uniq(xs.filter((x):x is string=>typeof x==='string'&&allowed.has(x))):[];
 const found=array(v.found,validObjects),studied=array(v.studied,validObjects),collected=array(v.collected,validObjects);
 const placements:CaseState['placements']={};for(const c of EVIDENCE_CARDS)if(v.placements?.[c.id]===c.category)placements[c.id]=c.category;
 const errors:Record<string,number>={};for(const c of EVIDENCE_CARDS){const n=v.classificationErrors?.[c.id];if(typeof n==='number'&&Number.isFinite(n))errors[c.id]=Math.max(0,Math.min(1000,Math.floor(n)));}
 const seen=new Set<string>();const timeline=Array.from({length:6},(_,i)=>{const id=v.timeline?.[i];if(typeof id!=='string'||!EVENT_CARDS.some(e=>e.id===id)||seen.has(id))return null;seen.add(id);return id;});
 let gap=false;const whys=Array.from({length:5},(_,i)=>{const a=v.whys?.[i];if(gap||!a||typeof a.text!=='string'||typeof a.verify!=='string'||!a.text.trim()||!a.verify.trim()){gap=true;return null;}return {key:String(a.key||'own'),text:a.text.slice(0,1200),path:['equipment','briefing','records','open'].includes(a.path)?a.path:'open',verify:a.verify.slice(0,2000)};});
 const nodeIds=new Set<string>();const nodes:CauseNode[]=[];
 if(Array.isArray(v.nodes))for(const n of v.nodes.slice(0,30)){if(!n||typeof n.id!=='string'||!n.id.match(/^[a-z0-9-]+$/)||nodeIds.has(n.id)||n.id==='incident'||typeof n.title!=='string')continue;nodeIds.add(n.id);nodes.push({id:n.id,title:n.title.slice(0,1200),parent:typeof n.parent==='string'?n.parent:null,evidence:typeof n.evidence==='string'?n.evidence:'',reason:typeof n.reason==='string'?n.reason.slice(0,2000):'',question:!!n.question});}
 for(const n of nodes)if(!canAttach(nodes,n.id,n.parent))n.parent=null;
 const gates:CaseState['gates']={};if(v.gates&&typeof v.gates==='object')for(const [id,g]of Object.entries(v.gates))if(g==='and'||g==='or')gates[id]=g;
 const phase=Math.max(1,Math.min(10,Number.isInteger(v.stage)?v.stage!:1));
 return {...EMPTY_CASE,...v,stage:phase,furthest:Math.max(phase,Math.min(10,Number.isInteger(v.furthest)?v.furthest!:1)),completed:Array.isArray(v.completed)?uniq(v.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=10)):[],managerRead:!!v.managerRead,decision:typeof v.decision==='string'?v.decision:null,decisionAttempts:Array.isArray(v.decisionAttempts)?v.decisionAttempts.filter(x=>['a','b','v','g'].includes(x)).slice(0,100):[],decisionPassed:!!v.decisionPassed,found,studied,collected,peopleIntroduced:!!v.peopleIntroduced,placements,classificationErrors:errors,asked:array(v.asked,new Set(['observation','leading','time','people'])) as QuestionId[],timeline,timelineChecked:!!v.timelineChecked&&!timelineIssue(timeline),timelineSaved:!!v.timelineSaved&&!timelineIssue(timeline),whys,whysSaved:!!v.whysSaved&&whys.every(Boolean),nodes,gates,treeChecked:!!v.treeChecked,treeSaved:!!v.treeSaved};
}
