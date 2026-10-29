(function courseApp(){
"use strict";
const tracks=window.COURSE_TRACKS||[];
const WORKSHOP=window.BACKEND_WORKSHOP||{weeks:[],labs:[],backendIds:[]};
const AI_WORKSHOP=window.AI_WORKSHOP||{weeks:[],labs:[],pathIds:[],hoursPerWeek:20};
const AWS_WORKSHOP=window.AWS_WORKSHOP||{weeks:[],labs:[]};
const BACKEND_ORDER=["node","api","postgres","auth","data","async","ops","testing","system","aws","genai","rag","agentic","ai","javascript","typescript","react","nextjs","resume"];
tracks.sort((a,b)=>{const ia=BACKEND_ORDER.indexOf(a.id),ib=BACKEND_ORDER.indexOf(b.id);return (ia<0?999:ia)-(ib<0?999:ib)});
const BACKEND_IDS=new Set(WORKSHOP.backendIds);
const AI_IDS=new Set(AI_WORKSHOP.pathIds);
const bank=window.INTERVIEW_BANK||[];
const labs=window.CODING_LABS||[];
const V=window.CourseVisuals;
const EXTERNAL_MEDIA_COUNT=Object.keys(window.LESSON_MEDIA||{}).length;
if(!V) throw Error("Visual assets script must load before app.js");
const lessons=tracks.flatMap(track=>track.lessons.map(l=>({...l,trackId:track.id,trackTitle:track.title})));
const lessonById=new Map(lessons.map(l=>[l.id,l]));
const trackById=new Map(tracks.map(t=>[t.id,t]));
const labById=new Map(labs.map(l=>[l.id,l]));
const KEY="fullstack-os-course-v2";
const defaults={done:[],checks:{},rated:{},bookmarks:[],notes:{},labDrafts:{},labPassed:{},mockAnswers:{},mockRubrics:{},dayDone:[],backendLabDone:[],aiLabDone:[],awsLabDone:[],activePath:"backend",theme:"light",lastStudiedLessonId:null,lastCompletedLessonId:null};
let progress;
try{progress={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{progress={...defaults}}
for(const key of ["done","bookmarks","dayDone","backendLabDone","aiLabDone","awsLabDone"])if(!Array.isArray(progress[key]))progress[key]=[];
if(!["backend","ai","foundations"].includes(progress.activePath))progress.activePath="backend";
for(const key of ["checks","rated","notes","labDrafts","labPassed","mockAnswers","mockRubrics"])if(!progress[key]||typeof progress[key]!=="object")progress[key]={};
const ui={topic:"all",level:"all",search:"",limit:10,lessonReveal:false,labReveal:false,labHint:0,labResults:null,day:0,flashIndex:0,flipped:false,showSample:false,toastTimer:null,mockTimer:null,mockSeconds:0};
const days=[
{theme:"JavaScript + TypeScript essentials",ids:["js-closures","js-event-loop","js-async","ts-unions"],lab:"lab-once",goal:"Predict event-loop output aloud and explain types without notes."},
{theme:"React rendering and TS patterns",ids:["ts-generics","ts-utils","react-render","react-effects"],lab:"lab-debounce",goal:"Debug stale closures and explain a render profile."},
{theme:"React → Next.js → performance",ids:["react-state","next-modes","next-lcp","next-cache"],lab:"lab-memo",goal:"Practice your 40% LCP story with actual evidence."},
{theme:"Node.js and PostgreSQL",ids:["node-runtime","node-http","node-reliability","sql-joins"],lab:"lab-maplimit",goal:"Build a reliable endpoint and predict query cardinality."},
{theme:"Database + authentication",ids:["sql-index","sql-tx","auth-flow","auth-threats"],lab:"lab-lru",goal:"Defend auth boundaries, DB uniqueness and index choices."},
{theme:"Security, tests, system design",ids:["auth-authorization","test-pyramid","test-ci","sys-estimation"],lab:"lab-rate",goal:"Whiteboard bottleneck estimates and threat model an API."},
{theme:"Real-time architecture + AI",ids:["sys-caching","sys-realtime","ai-graphs","ai-rag"],lab:"lab-cursor",goal:"Explain WebSocket fanout and an auditable SOP graph."},
{theme:"AI evaluation + full mock",ids:["ai-evals","test-observability","resume-stories","resume-leadership","resume-interview-plan"],lab:"lab-retry",goal:"Run a 45-minute fullstack mock; revisit remaining lessons."}
];
const mocks=[
{title:"Design a healthcare diagnostics dashboard",kind:"System design · 35 minutes",prompt:"You need to migrate a legacy clinical diagnostics desktop workflow into a secure web application used by several organizations. Design shell architecture, APIs, patient authorization, caching, release strategy and telemetry.",rubric:["Clarifies regulated data and nonfunctional requirements","Separates shared shell from domain microfrontends","Enforces patient and tenant authorization server-side","Chooses SSR/cache policies appropriate to sensitivity","Plans a gradual rollout, observability and failure recovery"],followup:"A remote module fails after deployment. What breaks, how do you roll it back, and what must remain usable?",outline:"Context and requirements → boundaries and data ownership → auth/tenancy → routing/rendering → rollout → observability → trade-offs."},
{title:"Debug a React performance regression",kind:"Frontend deep dive · 20 minutes",prompt:"A dashboard with 4,000 live vehicle markers now freezes for 400ms whenever a filter changes. You suspect a state update caused broad rerenders. Walk through diagnosis and a safe improvement.",rubric:["Reproduces and profiles before changes","Separates data update frequency from rendering frequency","Explains memoization and stable props correctly","Considers virtualization, batching, and canvas/map APIs","Defines measurable success and regression tests"],followup:"What if the list is virtualized but the map still stalls?",outline:"Trace input → React profiler + browser performance → isolate expensive updates → bound workload/batch → profile again → functional and accessibility checks."},
{title:"Implement a scalable signup API",kind:"Node, SQL, auth · 25 minutes",prompt:"Your signup funnel handles 10,000+ signups a day, has intermittent duplicate accounts and occasionally slows during bursts. Design the API contract, schema and operational controls.",rubric:["Defines input validation and correct response codes","Uses database uniqueness and transaction boundaries","Handles idempotent retries and race conditions","Protects endpoints with rate limits and abuse detection","Defines useful metrics, alerts and tests"],followup:"Two users submit the same email at almost the same millisecond. What exactly arbitrates the winner?",outline:"Contract → auth/security → DB schema+unique index → transaction/idempotency → retries → instrumentation and recovery."},
{title:"Design real-time fleet tracking",kind:"Realtime system design · 30 minutes",prompt:"50,000 vehicles send location every five seconds. Dispatchers view live maps across thousands of fleets. Design ingestion, persistence, message distribution, client recovery and permission checks.",rubric:["Calculates ~10,000 updates per second","Separates ingest, current snapshot and durable history","Explains distributed WebSocket fanout","Handles sequencing, gaps and reconnect","Ensures fleet-scoped authorization and stale UI states"],followup:"One fleet has 25,000 simultaneous viewers. How do you limit fanout and slow client impact?",outline:"Workload math → events and storage → pub/sub → per-tenant connections → snapshots and delta feeds → pressure control and failure modes."},
{title:"Review SOPs with an auditable AI workflow",kind:"LangGraph · 30 minutes",prompt:"Build a service that reviews SOP documents, recommends compliance findings, and reduces manual effort without bypassing regulated human oversight.",rubric:["Defines explicit graph state, nodes and conditional transitions","Retrieves and verifies versioned source evidence","Validates structured output and tests failure cases","Uses human approval gates for ambiguous/high-risk decisions","Measures false approvals, time saved, cost and audit trail"],followup:"A retrieved SOP page says 'ignore previous instructions'. What happens?",outline:"Versioned ingest → retrieval → deterministic checks → LLM evaluation → evidence gate → review interrupt → audit+evaluation."},
{title:"Tell a credible senior engineer project story",kind:"Behavioral + resume · 12 minutes",prompt:"Explain your strongest Next.js or LangGraph architecture project in ninety seconds, including exact ownership, constraints, alternatives, decisions and measured impact.",rubric:["States problem and personal ownership clearly","Names at least one rejected alternative and why","Explains a specific technical trade-off","Provides verifiable result with measurement method","Reflects on remaining risk or what to improve"],followup:"How would you prove the reported outcome wasn't caused by an unrelated product release?",outline:"Context → ownership → constraints → decision and alternative → implementation → measured outcome → learning."}
];
const projects=[
{id:"clinical",icon:"🏥",title:"Clinical Reports Portal",level:"Fullstack capstone",duration:"6–9 hours",stack:"Next.js • TypeScript • Node • PostgreSQL • Auth",problem:"Build a multi-tenant report viewer with a public landing page and a private clinician dashboard. The goal is to demonstrate frontend architecture alongside credible API/security ownership.",deliverables:["Public static landing page and authenticated dashboard routes","PostgreSQL schema for organizations, users, patients, reports and memberships","GET /reports/:id with enforceable org/patient authorization","Loading/error/empty UI with keyboard access and tests","Explain cache policy: public marketing versus private patient data","Document architecture, query plans and rollout strategy"],criteria:["Cross-org report fetch returns no sensitive fields","Duplicate reports constrained at database level where appropriate","One E2E path and one DB auth integration test","README with security and observability decisions"],interview:"Explain why a shell/microfrontend boundary is or is not justified at this project size. Outline a migration path if three teams later own separate workflows."},
{id:"fleet",icon:"🚙",title:"Live Fleet Tracking",level:"System design + realtime",duration:"6–8 hours",stack:"React • Node • WebSockets • PostgreSQL • Pub/Sub concepts",problem:"Build a miniature realtime dispatch dashboard with 100 simulated vehicles, location fanout, a current-location snapshot and a replayable event log.",deliverables:["Authenticated WebSocket subscription scoped to a fleet","Simulated GPS events with timestamp and per-vehicle sequence","Marker update UI with stale-location badges","Snapshot fetch after reconnect; ignore out-of-order messages","Document evolution from one Node instance to pub/sub fanout","Latency, connected clients and message-drop counters"],criteria:["Simulated disconnect/reconnect recovers the latest snapshot","Out-of-order updates never move a marker backward","Unauthorized fleet subscriptions are rejected","Architecture sketch estimates traffic at 50k vehicles"],interview:"Explain how 50,000 devices updating every five seconds become 10,000 ingest messages/sec and how you'd protect slow consumers."},
{id:"sop",icon:"✧",title:"Auditable SOP Review Engine",level:"AI engineering capstone",duration:"7–10 hours",stack:"Node or Python • LangGraph • Retrieval • Structured output",problem:"Build a small rule-driven document review pipeline whose AI suggestions are grounded in cited evidence, explicitly validated and escalated for human review.",deliverables:["Versioned source document fixtures and deterministic rule checks","Graph state with retrieve, validate, decide and human-review transitions","Structured finding schema with referenced section/source version","Checkpoint or resumable status tracking","A labeled evaluation set with missing-evidence and injection cases","Audit record recording review state and final human decision"],criteria:["Missing required evidence results in review, never fake approval","All cited source IDs correspond to indexed source passages","Injected instructions in documents do not override policy","Evaluation report includes correctness, time and failure cases"],interview:"Explain business time savings separately from accuracy; defend your escalation thresholds and how you'd avoid false approvals."}
];
const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const inline=t=>esc(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>");
function prose(text){return String(text||"").split(/\n\s*\n/).filter(Boolean).map(piece=>{const s=piece.trim();if(s.startsWith("## ")){const i=s.indexOf("\n");if(i<0)return `<h3>${inline(s.slice(3))}</h3>`;return `<h3>${inline(s.slice(3,i))}</h3><p>${inline(s.slice(i+1)).replaceAll("\n","<br>")}</p>`;}if(s.startsWith("- "))return "<ul>"+s.split("\n").filter(Boolean).map(x=>`<li>${inline(x.replace(/^- /,""))}</li>`).join("")+"</ul>";return `<p>${inline(s).replaceAll("\n","<br>")}</p>`;}).join("")}
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress))}catch(e){console.warn("Local save unavailable",e)}syncSidebar()}
function syncSidebar(){const n=progress.done.length;const bar=document.getElementById("side-progress");if(bar)bar.style.width=(n/Math.max(lessons.length,1)*100)+"%";const t=document.getElementById("side-progress-text");if(t)t.textContent=`${n} of ${lessons.length} lessons complete`;}
function showToast(text){const t=document.getElementById("toast");t.textContent=text;t.classList.add("show");clearTimeout(ui.toastTimer);ui.toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function trackProgress(track){const n=track.lessons.filter(l=>progress.done.includes(l.id)).length;return {n,total:track.lessons.length,pct:Math.round(n/track.lessons.length*100)}}
function codeBlock(title,text){return `<div class="code-wrap"><div class="code-head"><span>⌘ ${esc(title)}</span><button class="btn small ghost" data-action="copy-code" type="button">Copy code</button></div><pre><code>${esc(text)}</code></pre></div>`}
function heading(kicker,title,description){return `<div class="eyebrow">${esc(kicker)}</div><h1>${esc(title)}</h1>${description?`<p style="max-width:790px">${esc(description)}</p>`:""}`}
function bookmarkBtn(id){return `<button class="btn ghost small" data-action="bookmark" data-id="${esc(id)}">${progress.bookmarks.includes(id)?"★ Bookmarked":"☆ Bookmark"}</button>`}
function getLocation(){const hash=decodeURIComponent(location.hash.replace(/^#/,""));return hash||"dashboard"}
function go(path){if(getLocation()===path){render();scrollTo({top:0,behavior:"smooth"})}else location.hash=path}
function stat(label,value,detail,progressPct){return `<div class="stat"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div>${progressPct===undefined?`<div class="sub">${esc(detail)}</div>`:`<div class="bar"><span style="width:${progressPct}%"></span></div><small class="muted">${esc(detail)}</small>`}</div>`}
const LEARNING_PATHS=[
 {id:"backend",route:"backend",title:"Backend Engineering",short:"Backend",eyebrow:"FOUNDATION TO OWNERSHIP",description:"Build, secure and operate real Node services. Focus on APIs, data, queues and production debugging.",time:"4 weeks",className:"backend",index:1},
 {id:"ai",route:"ai-path",title:"AI Engineering",short:"AI Systems",eyebrow:"MODELS TO SYSTEMS",description:"Build GenAI features, grounded retrieval and controlled agents using your existing fullstack skills.",time:"4 weeks",className:"ai",index:2},
 {id:"foundations",route:"plan",title:"Fullstack Foundations",short:"Fullstack",eyebrow:"FOCUSED REVISION",description:"Refresh JavaScript, TypeScript, React, Next.js and fullstack design without repeating an entire beginner course.",time:"8-day sprint",className:"foundations",index:3}
];
function learningPath(id=progress.activePath){return LEARNING_PATHS.find(p=>p.id===id)||LEARNING_PATHS[0]}
function pathLessonIds(id){
 const ids=id==="backend"?[...(WORKSHOP.backendIds||[]),...(window.FULLSTACK_JOURNEY?.awsSprint?.ids||[])]:id==="ai"?(AI_WORKSHOP.pathIds||[]):[...new Set(days.flatMap(d=>d.ids))];
 return ids.filter(x=>lessonById.has(x));
}
function pathProgress(id){const ids=pathLessonIds(id),done=ids.filter(x=>progress.done.includes(x)).length;return {ids,done,total:ids.length,pct:ids.length?Math.round(100*done/ids.length):0}}
function nextOnPath(id){const a=pathProgress(id);return a.ids.map(key=>lessonById.get(key)).find(l=>l&&!progress.done.includes(l.id))||lessonById.get(a.ids.at(-1))||lessons[0]}
function nextWorkshop(id){
 if(id==="backend")return WORKSHOP.labs.find(l=>!progress.backendLabDone.includes(l.id))||WORKSHOP.labs[0];
 if(id==="ai")return AI_WORKSHOP.labs.find(l=>!progress.aiLabDone.includes(l.id))||AI_WORKSHOP.labs[0];
 return {id:days.find(d=>!progress.dayDone.includes(days.indexOf(d)))?.lab||days[0].lab,title:"Browser coding challenge"};
}
function nextWorkshopRoute(id){const x=nextWorkshop(id);return id==="backend"?"backend-lab/"+x.id:id==="ai"?"ai-lab/"+x.id:"labs/"+x.id}
function workshopForLesson(l){
 if(!l)return {lab:nextWorkshop(progress.activePath),route:nextWorkshopRoute(progress.activePath)};
 if(l.trackId==="aws"){const lab=AWS_WORKSHOP.labs.find(x=>x.lessonIds?.includes(l.id))||AWS_WORKSHOP.labs[0];return {lab,route:"aws-lab/"+lab.id};}
 // A lesson gets its OWN most relevant exercise, not the first incomplete lab
 // from whichever unrelated pathway the user opened last.
 const aiLabByLesson={
  "genai-tokens":"ai-gen-endpoint","genai-api":"ai-gen-endpoint",
  "genai-prompts":"ai-gen-contract","genai-structured":"ai-gen-contract",
  "genai-stream":"ai-gen-contract","genai-decisions":"ai-gen-contract",
  "rag-architecture":"ai-rag-index","rag-chunking":"ai-rag-index",
  "rag-embeddings":"ai-rag-search","rag-hybrid":"ai-rag-search",
  "rag-citations":"ai-rag-evals","rag-governance":"ai-rag-evals",
  "rag-evaluation":"ai-rag-evals",
  "agentic-loop":"ai-agent-tools","agentic-graph":"ai-agent-tools",
  "agentic-checkpoints":"ai-agent-tools","agentic-approval":"ai-agent-approval",
  "agentic-multi":"ai-capstone","agentic-rag":"ai-capstone",
  "agentic-security":"ai-capstone",
  "ai-graphs":"ai-agent-approval","ai-rag":"ai-rag-search",
  "ai-evals":"ai-rag-evals"
 };
 const aiLab=AI_WORKSHOP.labs.find(x=>x.id===aiLabByLesson[l.id]);
 if(aiLab)return {lab:aiLab,route:"ai-lab/"+aiLab.id};
 const aiWeek=AI_WORKSHOP.weeks.find(w=>w.lessons.includes(l.id));
 if(aiWeek){
  const lab=aiWeek.labs.map(id=>AI_WORKSHOP.labs.find(x=>x.id===id)).find(x=>x&&!progress.aiLabDone.includes(x.id))||AI_WORKSHOP.labs.find(x=>x.id===aiWeek.labs[0]);
  if(lab)return {lab,route:"ai-lab/"+lab.id};
 }
 const backendWeek=WORKSHOP.weeks.find(w=>w.lessons.includes(l.id));
 if(backendWeek){
  const chosen=l.id.startsWith("auth-")?"be-auth":
   l.id.startsWith("async-")?"be-worker":
   l.id==="redis-cache"||l.id.startsWith("mongo-")?"be-redis":
   l.id.startsWith("api-")?"be-contract":
   l.id.startsWith("ops-")?"be-deploy":
   l.id.startsWith("test-")?"be-review":null;
  const lab=WORKSHOP.labs.find(x=>x.id===chosen)||
   backendWeek.labs.map(id=>WORKSHOP.labs.find(x=>x.id===id)).find(x=>x&&!progress.backendLabDone.includes(x.id))||
   WORKSHOP.labs.find(x=>x.id===backendWeek.labs[0]);
  if(lab)return {lab,route:"backend-lab/"+lab.id};
 }
 if(["genai","rag","agentic","ai"].includes(l.trackId)){
  const lab=nextWorkshop("ai");return {lab,route:"ai-lab/"+lab.id};
 }
 const day=days.find(d=>d.ids.includes(l.id));
 if(day){
  const lab=labById.get(day.lab)||labs[0];
  return {lab,route:"labs/"+lab.id};
 }
 if(["node","api","postgres","auth","data","async","ops","testing","system"].includes(l.trackId)){
  const lab=nextWorkshop("backend");
  return {lab,route:"backend-lab/"+lab.id};
 }
 const lab=labs[0];return {lab,route:"labs/"+lab.id};
}
function pathWeekNumber(id){if(id==="foundations"){const index=days.findIndex(d=>!progress.dayDone.includes(days.indexOf(d)));return index<0?8:index+1;}
 const weeks=id==="backend"?WORKSHOP.weeks:AI_WORKSHOP.weeks,idx=weeks.findIndex(w=>w.lessons.some(l=>!progress.done.includes(l)));
 return (idx<0?weeks.length:idx+1);
}

function v6StageMap(context="learn"){
 const config=window.FULLSTACK_JOURNEY.stages;
 const active=progress.activePath==="ai"?"ai":progress.activePath==="foundations"?"interview":config.slice(0,3).find(stage=>stage.trackIds.some(id=>trackById.get(id)?.lessons.some(l=>!progress.done.includes(l.id))))?.id||"systems";
 const html=config.map(stage=>{
   const stageLessons=stage.trackIds.flatMap(id=>trackById.get(id)?.lessons||[]);
   const completed=stageLessons.filter(l=>progress.done.includes(l.id)).length;
   const next=stageLessons.find(l=>!progress.done.includes(l.id))||stageLessons[stageLessons.length-1];
   const current=stage.id===active;
   return `<details class="v6-stage ${current?"v6-stage-current":""}" ${current?"open":""}>
    <summary><span class="v6-stage-number">${stage.number}</span><span><span class="v6-stage-title">${esc(stage.title)}</span><span class="v6-stage-description">${esc(stage.description)}</span></span><span class="v6-stage-count">${completed}/${stageLessons.length} lessons</span><span class="v6-stage-chevron" aria-hidden="true">⌄</span></summary>
    <div class="v6-stage-detail"><p>${current?"Your current milestone. Work through one topic at a time.":"Explore this milestone whenever you need it."}</p><div class="v6-stage-topics">${stage.trackIds.map(id=>{const t=trackById.get(id);return t?`<button data-go="track/${id}">${esc(t.title)}</button>`:"";}).join("")}</div><div class="v6-stage-actions">${next?`<button class="btn journey-primary" data-go="lesson/${next.id}">Continue: ${esc(next.title)} ↗</button>`:""}${stage.id==="systems"?'<button class="journey-subtle-link" data-go="aws">AWS architect sprint ↗</button>':""}</div></div>
    </details>`;
 }).join("");
 return `<section class="v6-map" aria-label="Five-stage engineering journey"><div class="v6-section-heading"><div><span class="journey-kicker">YOUR ENGINEERING JOURNEY</span><h2>Build depth, one milestone at a time.</h2></div><p>${context==="dashboard"?"Your existing lessons, practice and projects are connected in one route.":"Select a milestone to see its tracks, or choose a focused study direction below."}</p></div><div class="v6-stage-list">${html}</div></section>`;
}
function awsPathPage(){
 const sprint=window.FULLSTACK_JOURNEY.awsSprint,plan=AWS_WORKSHOP;
 const done=sprint.ids.filter(id=>progress.done.includes(id)).length;
 const next=sprint.ids.map(id=>lessonById.get(id)).find(l=>l&&!progress.done.includes(l.id))||lessonById.get(sprint.ids.at(-1));
 return `<div class="journey-page journey-plan"><button class="journey-back" data-go="learn">← Learning Path</button><header class="journey-plan-header"><span class="journey-kicker">SYSTEMS & AWS / POST-BACKEND SPRINT</span><h1>AWS Solutions Architect.</h1><div class="v6-aws-intro"><p>Learn cloud architecture through first principles: problem → mechanism → request path → failure → decision. This sprint follows the existing four-week backend pathway rather than expanding its 80-hour estimate.</p></div><div class="journey-plan-meter"><div class="journey-progress-track"><span style="width:${Math.round(done/sprint.ids.length*100)}%"></span></div><span>${done}/${sprint.ids.length} lessons</span></div><div class="journey-plan-actions"><button class="btn journey-primary" data-go="lesson/${next.id}">Continue: ${esc(next.title)} ↗</button><button class="journey-subtle-link" data-go="practice/aws">AWS interview practice ↗</button></div></header><section class="journey-plan-outline"><div class="v6-section-heading"><div><span class="journey-kicker">CLOUD ARCHITECTURE</span><h2>Two focused sprints.</h2></div><p>Ten in-depth lessons and four self-verified, offline-friendly architecture workshops.</p></div>${plan.weeks.map((week,i)=>`<details class="journey-week" ${i===0?"open":""}><summary><span class="journey-week-index">${String(i+1).padStart(2,"0")}</span><div><span class="journey-minor">AWS SPRINT ${i+1}</span><h3>${esc(week.theme)}</h3></div><span class="journey-week-progress">${week.lessons.filter(id=>progress.done.includes(id)).length}/${week.lessons.length} lessons</span><span class="journey-week-chevron">⌄</span></summary><div class="journey-week-detail"><div><span class="journey-minor">01 / UNDERSTAND</span>${week.lessons.map((id,j)=>{const l=lessonById.get(id);return `<button data-go="lesson/${id}" class="journey-week-link"><span class="journey-check">${progress.done.includes(id)?"✓":"○"}</span><span>${esc(l.title)}</span><span class="journey-row-arrow">↗</span></button>`;}).join("")}</div><div><span class="journey-minor">02 / BUILD AND DEFEND</span>${week.labs.map(id=>{const l=plan.labs.find(x=>x.id===id);return `<button data-go="aws-lab/${id}" class="journey-week-link"><span class="journey-check">${progress.awsLabDone.includes(id)?"✓":"○"}</span><span>${esc(l.title)}</span><span class="journey-row-arrow">↗</span></button>`;}).join("")}<p class="journey-week-outcome">Cloud accounts and paid resources are not required. All cloud provisioning is optional and user-controlled.</p></div></div></details>`).join("")}</section><footer class="journey-plan-footer"><button data-go="backend">Core backend pathway ↗</button><button data-go="projects">Use this in a capstone ↗</button></footer></div>`;
}
function awsLabPage(id){
 const lab=AWS_WORKSHOP.labs.find(l=>l.id===id);if(!lab)return notFound();
 const complete=progress.awsLabDone.includes(id);
 return `<div class="journey-page journey-plan"><button class="journey-back" data-go="aws">← AWS architect sprint</button><header class="journey-plan-header"><span class="journey-kicker">AWS DESIGN LAB / SPRINT ${lab.week}</span><h1>${esc(lab.title)}</h1><p>${esc(lab.brief)}</p><p class="journey-minor">${esc(lab.duration)} · ${esc(lab.level)} · no paid account required</p></header><div class="lesson-content" style="max-width:780px"><section><h2>Implementation sequence</h2><ol>${lab.steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></section><section><h2>Deliverable</h2><p>${esc(lab.command)}</p></section><section><h2>Prove it works</h2><ul>${lab.acceptance.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p class="muted">${esc(lab.watch)}</p><button class="btn journey-primary" data-action="aws-lab-done" data-id="${lab.id}">${complete?"✓ Self-verified · undo":"I verified these criteria"}</button></section><section><a href="${esc(lab.reference)}" target="_blank" rel="noopener noreferrer">Read AWS official documentation ↗</a></section></div><div class="journey-plan-footer"><button data-go="practice/aws">Defend the design in interview practice ↗</button><button data-go="projects">Capstone projects ↗</button></div></div>`;
}
function dashboard(){
 const focus=learningPath(),p=pathProgress(focus.id),next=nextOnPath(focus.id);
 const practical=workshopForLesson(next),workshop=practical.lab,nextLabRoute=practical.route;
 const topicCount=bank.filter(q=>q.topic===next.trackId).length;
 return `<div class="journey-home">
 <header class="journey-home-header"><span class="journey-kicker">TODAY / KEEP MOVING</span><span class="journey-top-note">One meaningful step at a time</span></header>
 <section class="journey-focus">
  <div class="journey-focus-main"><div class="journey-eyebrow"><span class="journey-dot journey-dot--${focus.className}"></span> ${esc(focus.short.toUpperCase())} / YOUR NEXT LESSON</div>
    <h1>${esc(next.title)}</h1>
    <p class="journey-focus-description">${esc(next.goal)}</p>
    <div class="journey-actions"><button class="btn journey-primary" data-go="lesson/${next.id}">Start this lesson <span aria-hidden="true">→</span></button><button class="journey-subtle-link" data-go="learn">Change learning path ↗</button></div>
  </div>
  <aside class="journey-focus-aside"><span class="journey-minor">YOUR PROGRESS</span><strong>${p.pct}%</strong><div class="journey-progress-track" aria-label="${p.done} of ${p.total} lessons completed"><span style="width:${p.pct}%"></span></div><p>${p.done} of ${p.total} lessons mastered</p><div class="journey-aside-separator"></div><span class="journey-minor">CURRENT STAGE</span><b>${focus.id==="foundations"?"Day":"Week"} ${pathWeekNumber(focus.id)}</b><p>${esc(focus.time)} · learn at your own pace</p><button data-go="${focus.route}" class="journey-subtle-link">Open your roadmap ↗</button></aside>
 </section>
 ${v6StageMap("dashboard")}
 <footer class="journey-home-footer"><span>You don't have to do everything today.</span><button data-go="learn">Explore all learning paths ↗</button></footer></div>`;
}
function journeyPathPage(id){
 const isAI=id==="ai",focus=learningPath(id),plan=isAI?AI_WORKSHOP:WORKSHOP;
 const states=isAI?progress.aiLabDone:progress.backendLabDone;
 const counts=pathProgress(id),next=nextOnPath(id);
 const currentIndex=plan.weeks.findIndex(w=>w.lessons.some(l=>!progress.done.includes(l)));
 const activeWeek=currentIndex<0?plan.weeks.length-1:currentIndex;
 return `<div class="journey-page journey-plan"><button class="journey-back" data-go="learn">← All learning paths</button>
 <header class="journey-plan-header"><span class="journey-eyebrow"><span class="journey-dot journey-dot--${focus.className}"></span> YOUR STUDY PLAN · ${esc(focus.time.toUpperCase())}</span>
 <h1>${esc(focus.title)}.</h1><p>${esc(focus.description)}</p>
 <div class="journey-plan-meter"><div class="journey-progress-track"><span style="width:${counts.pct}%"></span></div><span>${counts.done}/${counts.total} lessons</span></div>
 <div class="journey-plan-actions"><button class="btn journey-primary" data-go="lesson/${next.id}">Continue: ${esc(next.title)} ↗</button><button class="journey-subtle-link" data-go="practice/${next.id}">Practice current topics ↗</button></div></header>
 <section class="journey-plan-outline"><div class="journey-section-label"><span class="journey-kicker">YOUR ROADMAP</span><h2>One week at a time.</h2><p>Only your current week is expanded. Open any other week to explore.</p></div>
 ${plan.weeks.map((w,i)=>{
   const done=w.lessons.filter(x=>progress.done.includes(x)).length;
   const complete=done===w.lessons.length&&w.labs.every(x=>states.includes(x));
   return `<details class="journey-week ${i===activeWeek?"is-current":""} ${complete?"is-complete":""}" ${i===activeWeek?"open":""}>
    <summary><span class="journey-week-index">${String(i+1).padStart(2,"0")}</span><div><span class="journey-minor">${complete?"COMPLETED":i===activeWeek?"CURRENT WEEK":"COMING UP"}</span><h3>${esc(w.theme)}</h3></div><span class="journey-week-progress">${done}/${w.lessons.length} lessons</span><span class="journey-week-chevron">⌄</span></summary>
    <div class="journey-week-detail"><div><span class="journey-minor">01 / LEARN</span>
     ${w.lessons.map(k=>{const l=lessonById.get(k);return l?`<button data-go="lesson/${k}" class="journey-week-link"><span class="journey-check">${progress.done.includes(k)?"✓":"○"}</span><span>${esc(l.title)}</span><span class="journey-row-arrow">↗</span></button>`:""}).join("")}
    </div><div><span class="journey-minor">02 / BUILD</span>
    ${w.labs.map(k=>{const l=plan.labs.find(x=>x.id===k);return l?`<button data-go="${isAI?"ai-lab":"backend-lab"}/${k}" class="journey-week-link"><span class="journey-check">${states.includes(k)?"✓":"○"}</span><span>${esc(l.title)}</span><span class="journey-row-arrow">↗</span></button>`:""}).join("")}
    <p class="journey-week-outcome">${esc(w.milestone)}</p></div></div>
   </details>`;
 }).join("")}</section>
 <footer class="journey-plan-footer"><a href="${esc(plan.starter)}" target="_blank" rel="noopener noreferrer">Source code for local workshops ↗</a><button data-go="curriculum">Explore the course library ↗</button></footer>
 </div>`;
}
function backendPathPage(){const base=journeyPathPage("backend");return base.replace('<footer class="journey-plan-footer">','<section class="v6-aws-intro"><span class="journey-kicker">AFTER CORE BACKEND / CLOUD ARCHITECTURE</span><h2>Ready to design on AWS?</h2><p>Continue with the separate AWS Solutions Architect sprint: VPC, IAM, compute, databases, queues, multi-AZ recovery and cost trade-offs.</p><button class="btn journey-primary" data-go="aws">Open AWS architect sprint ↗</button></section><footer class="journey-plan-footer">')}

function backendLabPage(id){
 const lab=WORKSHOP.labs.find(x=>x.id===id)||WORKSHOP.labs[0];if(!lab)return notFound();
 const i=WORKSHOP.labs.findIndex(x=>x.id===lab.id),done=progress.backendLabDone.includes(lab.id);
 const next=WORKSHOP.labs[i+1];
 return `<button class="back" data-go="backend">← Backend learning pathway</button><div class="backend-lab-header"><div class="eyebrow">LOCAL ENGINEERING WORKSHOP · WEEK ${lab.week} · MISSION ${i+1}/${WORKSHOP.labs.length}</div><h1>${esc(lab.title)}</h1><p>${esc(lab.brief)}</p><div class="backend-lab-meta"><span>${esc(lab.level)}</span><span>${esc(lab.duration)}</span><span>${done?"✓ Self-verified":"Not yet marked complete"}</span></div></div>
 <div class="backend-lab-grid"><article><section><h2>Implementation sequence</h2><ol class="backend-steps">${lab.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></section><section><h2>Run it locally</h2><p>These commands run on your computer in the backend-starter directory, not in this website.</p>${codeBlock("Local terminal / illustrative commands",lab.command)}<p class="muted">Source project: <a href="${esc(WORKSHOP.starter)}" target="_blank" rel="noopener noreferrer">Backend starter and setup guide ↗</a></p></section><section><h2>Acceptance criteria</h2><ul class="backend-acceptance">${lab.acceptance.map(s=>`<li><span>□</span>${esc(s)}</li>`).join("")}</ul><div class="backend-warning"><b>Engineering caution</b><p>${esc(lab.watch)}</p></div><button class="btn ${done?"secondary":""}" data-action="backend-lab-done" data-id="${lab.id}">${done?"✓ Marked self-verified · undo":"I completed and verified these checks"}</button></section><section><h2>Reference</h2><a href="${esc(lab.reference)}" target="_blank" rel="noopener noreferrer">Read official guidance ↗</a></section></article>
 <aside class="backend-lab-rail"><span class="eyebrow">OTHER MISSIONS</span>${WORKSHOP.labs.map((x,j)=>`<button data-go="backend-lab/${x.id}" class="${x.id===lab.id?"current":""}"><span>${progress.backendLabDone.includes(x.id)?"✓":String(j+1).padStart(2,"0")}</span>${esc(x.title)}</button>`).join("")}${next?`<button class="backend-next" data-go="backend-lab/${next.id}">Next mission →</button>`:""}</aside></div>`;
}

function aiPathPage(){return journeyPathPage("ai")}
function aiLabPage(id){
 const l=AI_WORKSHOP.labs.find(x=>x.id===id)||AI_WORKSHOP.labs[0];if(!l)return notFound();
 const i=AI_WORKSHOP.labs.findIndex(x=>x.id===l.id),done=progress.aiLabDone.includes(l.id),next=AI_WORKSHOP.labs[i+1];
 return `<button class="back" data-go="ai-path">← AI engineering pathway</button>
 <div class="backend-lab-header"><div class="eyebrow">LOCAL AI ENGINEERING WORKSHOP · WEEK ${l.week} · MISSION ${i+1}/${AI_WORKSHOP.labs.length}</div>
 <h1>${esc(l.title)}</h1><p>${esc(l.brief)}</p>
 <div class="backend-lab-meta"><span>${esc(l.level)}</span><span>${esc(l.duration)}</span><span>${done?"✓ Self-verified":"Not yet marked complete"}</span></div></div>
 <div class="backend-lab-grid"><article>
 <section><h2>Implementation steps</h2><ol class="backend-steps">${l.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></section>
 <section><h2>Run and inspect locally</h2><p>These commands run in your own Node environment. This static website does not execute paid models or your local terminal.</p>${codeBlock("Local terminal / starting commands",l.command)}
 <p class="muted">Study project: <a href="${esc(AI_WORKSHOP.starter)}" target="_blank" rel="noopener noreferrer">AI starter source and setup ↗</a></p></section>
 <section><h2>Acceptance criteria</h2><ul class="backend-acceptance">${l.acceptance.map(x=>`<li><span>□</span>${esc(x)}</li>`).join("")}</ul>
 <div class="backend-warning"><b>Engineering caution</b><p>${esc(l.warning)}</p></div>
 <button class="btn ${done?"secondary":""}" data-action="ai-lab-done" data-id="${l.id}">${done?"✓ Self-verified · undo":"I completed and checked these conditions"}</button></section>
 <section><h2>Further reading</h2><a href="${esc(l.reference)}" target="_blank" rel="noopener noreferrer">Official documentation ↗</a></section></article>
 <aside class="backend-lab-rail"><span class="eyebrow">ALL AI WORKSHOPS</span>${AI_WORKSHOP.labs.map((x,j)=>`<button data-go="ai-lab/${x.id}" class="${x.id===l.id?"current":""}"><span>${progress.aiLabDone.includes(x.id)?"✓":String(j+1).padStart(2,"0")}</span>${esc(x.title)}</button>`).join("")}
 ${next?`<button class="backend-next" data-go="ai-lab/${next.id}">Next mission →</button>`:""}</aside></div>`;
}
function learnPage(){
 const selected=learningPath();
 return `<div class="journey-page journey-learn"><header class="journey-page-intro"><span class="journey-kicker">LEARNING PATH / YOUR ENGINEERING ROADMAP</span><h1>One connected learning path.</h1><p>The courses are connected, but your attention doesn't have to be split. Pick the path that matters most right now; you can switch at any time.</p></header>
 ${v6StageMap("learn")}
 <div class="v6-section-heading v6-path-choice"><div><span class="journey-kicker">YOUR STUDY FOCUS</span><h2>Choose the next direction.</h2></div><p>Backend first by default; switch to AI or the fullstack refresher without losing progress.</p></div>
 <div class="journey-path-list" aria-label="Learning paths">${LEARNING_PATHS.map(p=>{
  const stat=pathProgress(p.id),active=selected.id===p.id;
  return `<section class="journey-path-option ${active?"is-active":""}">
   <div class="journey-path-order"><span class="journey-path-glyph journey-path-glyph--${p.className}">${String(p.index).padStart(2,"0")}</span></div>
   <div class="journey-path-copy"><span class="journey-minor">${esc(p.eyebrow)} ${active?" · YOUR FOCUS":""}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><div class="journey-path-progress"><div class="journey-progress-track"><span style="width:${stat.pct}%"></span></div><span>${stat.done}/${stat.total} lessons · ${esc(p.time)}</span></div></div>
   <div class="journey-path-action"><button class="${active?"btn journey-primary":"journey-path-link"}" data-action="choose-path" data-id="${p.id}">${active?"Continue this path":"Choose this path"} <span aria-hidden="true">↗</span></button></div>
  </section>`;
 }).join("")}</div>
 <div class="journey-reference-links"><div><span class="journey-minor">A REFERENCE, NOT A SECOND PATH</span><p>Need a specific topic or system diagram? The entire course library is still here.</p></div><button data-go="curriculum">Browse all ${tracks.length} course tracks ↗</button><button data-go="diagrams">Architecture diagrams ↗</button></div></div>`;
}
function questionForLesson(l){
 const qs=bank.filter(q=>q.topic===l.trackId);
 const exact=qs.find(q=>q.id.startsWith(l.id+"-q"));
 if(exact)return exact;
 if(!qs.length)return null;
 const omit=new Set(["with","from","and","the","for","your","into","what","when","that","this","using","should","about","systems","system","engineering"]);
 const titleWords=[...new Set((l.title+" "+l.goal).toLowerCase().replace(/[^a-z0-9]+/g," ").split(/\s+/).filter(w=>w.length>3&&!omit.has(w)))];
 return qs.map(q=>{
  const hay=(q.q+" "+q.followup).toLowerCase();
  return {q,score:titleWords.reduce((n,w)=>n+(hay.includes(w)?1:0),0)};
 }).sort((a,b)=>b.score-a.score)[0]?.q||qs[0];
}
function latestLessonForPractice(){
 const latest=lessonById.get(progress.lastCompletedLessonId);
 const current=learningPath().id;
 if(!latest)return null;
 if(current==="ai"&&["genai","rag","agentic","ai"].includes(latest.trackId))return latest;
 if(current==="backend"&&(BACKEND_IDS.has(latest.id)||latest.trackId==="aws"))return latest;
 if(current==="foundations"&&pathLessonIds("foundations").includes(latest.id))return latest;
 return null;
}
function practicePage(topicId){
 const exactLesson=lessonById.get(topicId);
 const chosenTrack=trackById.get(topicId);
 const current=exactLesson||(chosenTrack?.lessons.find(l=>!progress.done.includes(l.id))||chosenTrack?.lessons[0])||latestLessonForPractice()||nextOnPath(learningPath().id);
 const chosen=exactLesson?.trackId||(trackById.has(topicId)?topicId:current.trackId);
 const related=bank.filter(q=>q.topic===chosen);
 const question=exactLesson?questionForLesson(exactLesson):!trackById.has(topicId)?questionForLesson(current):related.find(q=>!progress.rated[q.id])||related[0];
 const fallback=question||related[0]||bank.find(q=>!progress.rated[q.id])||bank[0];
 const subject=trackById.get(chosen),rating=progress.rated[fallback.id];
 const currentFocus=learningPath(),practical=workshopForLesson(current),nextLab=practical.lab,labRoute=practical.route;
 const contextLabel=exactLesson?"PRACTICE / FROM YOUR LESSON":"PRACTICE / ACTIVE RECALL";
 return `<div class="journey-page journey-practice journey-practice-v2">
 <header class="journey-page-intro"><span class="journey-kicker">${contextLabel}</span>
 <h1>Can you explain it?</h1>
 <p>${exactLesson?`You just studied <b>${esc(exactLesson.title)}</b>. Now answer one question without looking at the notes.`:"Recall a concept without notes, check your reasoning, then apply what you know."}</p>
 </header>
 <section class="practice-one-question" aria-label="Active recall">
 <div class="practice-topic-line"><span class="journey-dot journey-dot--${["genai","rag","agentic","ai"].includes(chosen)?"ai":"backend"}"></span>
 <span>${esc(subject?.title||currentFocus.title)}</span><span class="practice-attempt-status">${rating==="ready"?"RECALLED":rating==="review"?"REVISIT LATER":"ONE QUESTION"}</span></div>
 <h2>${esc(fallback.q)}</h2>
 <p class="practice-speak-prompt">Explain your reasoning out loud before opening the answer.</p>
 <details class="practice-answer-detail"><summary><span>Reveal answer and follow-up</span><span aria-hidden="true">⌄</span></summary>
 <div class="practice-answer-copy"><p>${esc(fallback.answer)}</p><div class="practice-follow-up"><span class="journey-minor">INTERVIEWER FOLLOW-UP</span><p>${esc(fallback.followup)}</p></div></div>
 </details>
 <div class="practice-evaluation"><span>How confidently could you explain it?</span><div>
 <button data-action="practice-grade" data-id="${fallback.id}" data-rating="review" class="${rating==="review"?"is-selected":""}">↺ Review again</button>
 <button data-action="practice-grade" data-id="${fallback.id}" data-rating="ready" class="${rating==="ready"?"is-selected":""}">✓ I understand it</button>
 </div></div>
 </section>
 <div class="practice-followthrough"><div><span class="journey-kicker">NEXT / USE IT</span><h2>Put the concept to work.</h2><p>${esc(nextLab.title)}. Testing a real implementation is what turns recall into engineering confidence.</p>
 <button class="btn journey-primary" data-go="${labRoute}">Open the practical exercise ↗</button></div>
 <div class="practice-secondary-links"><span class="journey-minor">KEEP PRACTICING</span>
 <button data-action="study-questions" data-id="${related.length?chosen:"all"}">More questions from ${esc(subject?.title||"this topic")} ↗</button>
 <button data-go="mocks">Try a mock interview ↗</button>
 ${exactLesson?`<button data-go="lesson/${exactLesson.id}">Return to the lesson ↗</button>`:""}
 </div></div>
 <div class="v6-prove-project"><h3>Make it interview-defensible.</h3><p>Use the same reasoning in a complete project, then explain requirements, failure modes and measurable outcomes.</p><button class="journey-subtle-link" data-go="projects">Explore capstone projects ↗</button></div>
 <details class="journey-extra-tools"><summary>Browse other practice tools <span aria-hidden="true">⌄</span></summary>
 <div><button data-go="flashcards">Revision cards ↗</button><button data-go="labs">Browser coding challenges ↗</button>
 <button data-go="diagrams">Architecture diagrams ↗</button><button data-go="interviews">Full interview bank ↗</button></div></details>
 </div>`;
}
function curriculum(){
 const groups=[
 {name:"Backend and architecture",caption:"APIs · databases · AWS architecture · operations · system design",ids:["node","api","postgres","auth","data","async","ops","testing","system","aws"]},
 {name:"AI engineering",caption:"GenAI · evidence retrieval · tool-driven workflows",ids:["genai","rag","agentic","ai"]},
 {name:"Fullstack and interview foundations",caption:"JavaScript · TypeScript · React · Next.js · career storytelling",ids:["javascript","typescript","react","nextjs","resume"]}
 ];
 return `<div class="journey-page journey-library"><button class="journey-back" data-go="learn">← Learning paths</button>
  <header class="journey-page-intro"><span class="journey-kicker">COURSE LIBRARY · ${tracks.length} TRACKS</span><h1>Every topic. One place.</h1><p>This is your reference shelf—not another checklist you have to finish. Follow your chosen pathway for recommended order.</p></header>
  ${groups.map((g,i)=>`<section class="journey-library-group"><div class="journey-library-group-heading"><span class="journey-minor">${String(i+1).padStart(2,"0")}</span><div><h2>${esc(g.name)}</h2><p>${esc(g.caption)}</p></div></div>
   <div class="journey-library-rows">${g.ids.map(id=>{const t=trackById.get(id);if(!t)return "";const stat=trackProgress(t);
    return `<button class="journey-library-row" data-go="track/${id}"><span>${esc(t.title)}</span><span class="journey-library-metadata">${stat.n}/${stat.total} lessons</span><span class="journey-row-arrow">↗</span></button>`;
   }).join("")}</div></section>`).join("")}</div>`;
}
function trackPage(id){
 const t=trackById.get(id);if(!t)return notFound();
 const stat=trackProgress(t),next=t.lessons.find(l=>!progress.done.includes(l.id))||t.lessons[0];
 return `<div class="journey-page journey-track">
  <button class="journey-back" data-go="curriculum">← Course library</button>
  <header class="journey-plan-header"><span class="journey-kicker">COURSE TRACK · ${esc(t.level.toUpperCase())}</span><h1>${esc(t.title)}.</h1>
  <p>${esc(t.summary)}</p><p class="journey-track-reason">${esc(t.why)}</p>
  <div class="journey-plan-meter"><div class="journey-progress-track"><span style="width:${stat.pct}%"></span></div><span>${stat.n}/${stat.total} mastered</span></div>
  <div class="journey-plan-actions"><button class="btn journey-primary" data-go="lesson/${next.id}">Continue learning ↗</button>
  <button class="journey-subtle-link" data-go="practice/${t.id}">Practice this topic ↗</button></div></header>
  <section class="journey-track-lessons"><div class="journey-section-label"><span class="journey-kicker">THE SYLLABUS</span><h2>Follow the lessons in order.</h2></div>
  ${t.lessons.map((l,i)=>`<button class="journey-track-row" data-go="lesson/${l.id}">
   <span class="journey-week-index">${progress.done.includes(l.id)?"✓":String(i+1).padStart(2,"0")}</span>
   <div><h3>${esc(l.title)}</h3><p>${esc(l.goal)}</p></div><span class="journey-track-time">${l.minutes} min</span><span class="journey-row-arrow">↗</span>
  </button>`).join("")}</section>
  <footer class="journey-plan-footer"><button data-go="practice/${t.id}">Answer related interview questions ↗</button><button data-go="learn">All learning paths ↗</button></footer>
 </div>`;
}
const MEDIA=window.LESSON_MEDIA||{};
function sourcedMediaTile(m,more=false){
 const imageUrl=esc(m.src),title=esc(m.title),credit=esc(m.credit),source=esc(m.source),license=esc(m.license),insight=esc(m.insight);
 return `<figure class="external-visual ${more?"external-visual--secondary":""}">
  <div class="external-visual-stage">
    <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" title="View original asset at full resolution">
      <img class="external-visual-img" src="${imageUrl}" alt="${title}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.hidden=true;this.closest('.external-visual-stage').classList.add('external-visual-stage--unavailable')">
      <div class="external-visual-fallback"><span>External diagram unavailable to embed</span><span class="fallback-action">View original asset ↗</span></div>
    </a>
    <a class="external-original-link" href="${imageUrl}" target="_blank" rel="noopener noreferrer">↗ View full-size asset</a>
  </div>
  <figcaption><span class="media-attribution"><b>${title}</b><span>Source: <a href="${source}" target="_blank" rel="noopener noreferrer">${credit} ↗</a> <span class="media-license">${license}</span></span></span>
  <span class="media-insight"><span class="insight-symbol">◈</span> ${insight}</span></figcaption>
 </figure>`;
}

function sourcedLessonGallery(l) {
 const item=MEDIA[l.id];
 if(!item)return `<div class="lesson-artwork">${V.lesson(l.id,l.trackId,l.title)}</div>`;
 const sources=[item,...(Array.isArray(item.extras)?item.extras:[])];
 const count=sources.length;
 const galleryId="source-carousel-"+l.id;
 const buttons=count>1?`<div class="source-carousel-toolbar">
   <span class="source-carousel-position" data-source-position aria-live="polite" aria-atomic="true">1 / ${count}</span>
   <div class="source-carousel-actions">
     <button type="button" class="source-carousel-arrow" data-action="source-prev" aria-label="Previous source illustration" aria-controls="${galleryId}"><span aria-hidden="true">←</span><span>Previous</span></button>
     <button type="button" class="source-carousel-arrow" data-action="source-next" aria-label="Next source illustration" aria-controls="${galleryId}"><span>Next</span><span aria-hidden="true">→</span></button>
   </div>
 </div>`:"";
 const dots=count>1?`<div class="source-carousel-pagination" role="group" aria-label="Choose a source">
   ${sources.map((source,i)=>`<button type="button" class="source-carousel-dot ${i===0?"active":""}" data-action="source-jump" data-index="${i}" aria-label="Show source ${i+1}: ${esc(source.title)}" aria-pressed="${i===0?"true":"false"}"><span></span></button>`).join("")}
 </div>`:"";
 return `<section class="lesson-real-media" aria-label="Curated illustrations and diagrams from original technical sources">
 <header class="media-section-header"><div><span class="eyebrow">CONCEPT VISUALIZATION / CURATED SOURCE</span><h3>See how it actually works.</h3></div><span class="media-curated-tag">${count} ORIGINAL SOURCE${count===1?"":"S"} · HD / VECTOR</span></header>
 <div class="source-carousel" role="region" aria-roledescription="carousel" aria-label="Source illustrations for ${esc(l.title)}" data-source-index="0" tabindex="0">
   ${buttons}
   <div class="source-carousel-slides" id="${galleryId}">
     ${sources.map((source,i)=>`<div class="source-slide" role="group" aria-roledescription="slide" aria-label="Source ${i+1} of ${count}: ${esc(source.title)}" ${i===0?"":'hidden aria-hidden="true"'}>${sourcedMediaTile(source,i>0)}</div>`).join("")}
   </div>
   ${dots}
 </div>
 <div class="reference-footnote"><span>◎</span> Each illustration retains its publisher credit, original link and usage note. Images are hosted by their original sources.</div>
 </section>`;
}
function setSourceSlide(carousel,requestedIndex){
 if(!carousel)return;
 const slides=Array.from(carousel.querySelectorAll(".source-slide"));
 if(!slides.length)return;
 const index=((requestedIndex%slides.length)+slides.length)%slides.length;
 carousel.dataset.sourceIndex=String(index);
 slides.forEach((slide,i)=>{
   const visible=i===index;
   slide.hidden=!visible;
   if(visible)slide.removeAttribute("aria-hidden");
   else slide.setAttribute("aria-hidden","true");
 });
 const position=carousel.querySelector("[data-source-position]");
 if(position)position.textContent=(index+1)+" / "+slides.length;
 carousel.querySelectorAll('[data-action="source-jump"]').forEach((button,i)=>{
   button.classList.toggle("active",i===index);
   button.setAttribute("aria-pressed",String(i===index));
 });
}
function moveSourceSlide(carousel,delta){
 if(!carousel)return;
 const current=Number(carousel.dataset.sourceIndex)||0;
 setSourceSlide(carousel,current+delta);
}


const COURSE_DEPTH=window.COURSE_DEPTH||{};
function deepChapterBody(l){
 const d=COURSE_DEPTH[l.id];
 if(!d)return `<div class="callout warn"><b>Deep lesson content not loaded</b><p>Review the standard worked example and try the checkpoint.</p></div>`;
 return `<section class="extended-chapters" id="lesson-deep-${l.id}">
 <div class="deep-kicker"><span class="eyebrow">GO DEEPER / ${d.chapters.length} CHAPTERS</span><span class="deep-estimate">${Math.max(9,Math.round((d.chapters.map(x=>x.body).join(" ").split(/\s+/).length + l.theory.split(/\s+/).length)/130))} MIN READING</span></div>
 <h2 class="deep-title">How this works in the real world</h2>
 
 ${d.chapters.map((ch,i)=>`<section class="deep-chapter" id="deep-${l.id}-${i}">
 <div class="chapter-number"><span>${String(i+1).padStart(2,"0")}</span><div><small>CHAPTER ${String(i+1).padStart(2,"0")} OF ${String(d.chapters.length).padStart(2,"0")}</small><h3>${esc(ch.title)}</h3></div></div>
 <div class="prose deep-prose">${prose(ch.body)}</div>
 ${ch.code?codeBlock(ch.codeLabel||"Trace this example",ch.code):""}
 ${ch.trace?`<div class="deep-trace"><b>↳ Walkthrough</b><p>${esc(ch.trace)}</p></div>`:""}
 </section>`).join("")}
 </section>`;
}
function deepScenarioBody(l){
 const d=COURSE_DEPTH[l.id];
 if(!d?.scenario)return "";
 const a=d.scenario;
 return `<section class="case-study" id="case-${l.id}">
 <div class="case-study-heading"><span class="eyebrow">PRODUCTION CASE / WHAT CAN GO WRONG</span></div>
 <h2>${esc(a.title)}</h2>
 <div class="case-situation"><span>01 / THE PROBLEM</span><p>${esc(a.situation)}</p></div>
 <div class="case-steps">
 <div><span>02 / INVESTIGATE</span><p>${esc(a.investigation)}</p></div>
 <div><span>03 / DESIGN THE FIX</span><p>${esc(a.solution)}</p></div>
 <div><span>04 / TRADE-OFFS</span><p>${esc(a.tradeoff)}</p></div>
 </div>
 <div class="case-deliverable"><b>✦ Your engineering assignment</b><p>${esc(a.deliverable)}</p></div>
 </section>`;
}
function deepInterviewBody(l){
 const d=COURSE_DEPTH[l.id];
 if(!d)return "";
 return `<section class="interview-synthesis" id="interview-${l.id}">
 <div class="eyebrow">FOR THE INTERVIEW / 90 SECONDS</div>
 <h2>Explain it clearly</h2>
 <p>${esc(d.interview)}</p>
 <div class="interview-callout">Don't memorize this word-for-word. Explain the mechanism, name a failure case and justify one design trade-off in your own language.</div>
 <button class="btn secondary small" data-action="copy-interview" data-id="${l.id}">Copy answer to rehearse</button>
 </section>
 <section class="primary-sources"><div class="eyebrow">CONTINUE READING / PRIMARY REFERENCES</div>
 <div class="reference-links">${(d.references||[]).map(([name,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span>↗</span>${esc(name)}</a>`).join("")}</div>
 <p class="tiny muted">Official documentation and additional reading support the course; version-specific behavior should be checked against the framework version you use.</p>
 </section>`;
}

function lessonPage(id){const l=lessonById.get(id);if(!l)return notFound();const t=trackById.get(l.trackId),position=t.lessons.findIndex(x=>x.id===id),completed=progress.done.includes(id),checked=progress.checks[id],next=t.lessons[position+1]||lessons[lessons.findIndex(x=>x.id===id)+1];const opts=l.check.options.map((opt,i)=>`<button class="option ${checked===i?(i===l.check.correct?"correct":"incorrect"):""}" data-action="answer-check" data-id="${l.id}" data-index="${i}">${String.fromCharCode(65+i)}. ${esc(opt)}</button>`).join("");return `<button class="back" data-go="track/${t.id}">← ${esc(t.title)}</button><div class="lesson-layout"><div class="lesson-main"><div class="lesson-heading"><div class="eyebrow">${esc(t.title)} · LESSON ${position+1} OF ${t.lessons.length}</div><h1>${esc(l.title)}</h1><p class="lead">${esc(l.goal)}</p><div class="lesson-context-meta"><span>◷ ${l.minutes} min</span><span>${completed?"✓ Completed":"A checkpoint to complete"}</span>${bookmarkBtn(l.id)}</div></div><nav class="lesson-phase-nav" aria-label="Lesson stages"><button type="button" data-action="jump-section" data-id="overview-${l.id}"><span>01</span><b>Understand</b></button><button type="button" data-action="jump-section" data-id="example-${l.id}"><span>02</span><b>Apply</b></button><button type="button" data-action="jump-section" data-id="checkpoint-${l.id}"><span>03</span><b>Check</b></button><button type="button" data-go="practice/${l.id}"><span>04</span><b>Defend</b></button></nav><article class="lesson-content"><section class="lesson-overview" id="overview-${l.id}"><div class="eyebrow">01 / THE CONCEPT</div><h2>Start with the mental model</h2><div class="prose">${prose(l.theory)}</div></section>${sourcedLessonGallery(l)}${deepChapterBody(l)}<section id="example-${l.id}" class="worked-example"><div class="eyebrow">02 / WORK THROUGH IT</div><h2>Read the implementation</h2>${codeBlock("Walk through line-by-line",l.code)}<div class="callout"><b>Why this code works</b><p>${esc(l.walkthrough)}</p></div><div class="callout warn"><b>Common interview trap</b><p>${esc(l.pitfall)}</p></div></section>${deepScenarioBody(l)}<section id="practice-${l.id}" class="lesson-practice"><div class="eyebrow">HANDS-ON / TRY THE IDEA</div><h2>Try it yourself</h2><p>${esc(l.task)}</p><button class="btn secondary small" data-action="toggle-lesson-solution">${ui.lessonReveal?"Hide worked answer":"Reveal worked answer"}</button><div id="lesson-solution" ${ui.lessonReveal?"":"hidden"}>${codeBlock("Model solution / reasoning",l.solution)}</div></section>${deepInterviewBody(l)}<hr><div id="checkpoint-${l.id}" class="knowledge"><div class="eyebrow">03 / CHECK YOUR UNDERSTANDING</div><h3>${esc(l.check.q)}</h3>${opts}<div class="reveal" ${checked===undefined?"hidden":""}><b>${checked===l.check.correct?"✓ Correct.":"Not quite — try another option."}</b> ${esc(l.check.why)}</div></div>${completed?`<div class="lesson-completion"><div class="lesson-completion-icon" aria-hidden="true">✓</div><div><span class="journey-minor">LESSON COMPLETE / NEXT STEP</span><h3>Now explain it without notes.</h3><p>You have passed the checkpoint. Practice a related interview question, then move to the next lesson when you are ready.</p><div class="lesson-completion-actions"><button class="btn journey-primary" data-go="practice/${l.id}">Practice this lesson ↗</button>${next?`<button class="journey-subtle-link" data-go="lesson/${next.id}">Next lesson →</button>`:""}</div></div></div>`:`<div class="progress-check"><div><b>${checked===l.check.correct?"Checkpoint passed":"Complete the checkpoint"}</b><p>${checked===l.check.correct?"Mark the lesson complete to continue into interview practice.":"Choose the correct answer above. You can retry as needed."}</p></div><button class="btn" data-action="complete-lesson" data-id="${l.id}" ${checked!==l.check.correct?"disabled":""}>Mark lesson complete ✓</button></div>`}<hr><h3>Your private learning notes</h3><p class="tiny">Write an explanation in your own words. Saved on this device.</p><textarea class="textarea" id="lesson-notes" data-save-note="${l.id}" placeholder="What was hard? What would you tell an interviewer?">${esc(progress.notes[l.id]||"")}</textarea><p class="tiny muted">Autosaved locally as you type.</p></article><div class="flex between" style="margin-top:23px"><button class="journey-inline-practice" data-go="practice/${l.id}">Practice this lesson ↗</button><button class="btn secondary" data-go="track/${t.id}">← Track overview</button>${next?`<button class="btn" data-go="lesson/${next.id}">Next lesson →</button>`:""}</div></div><aside class="lesson-aside" aria-label="Lesson navigation"><nav class="reading-rail"><div class="rail-section"><div class="eyebrow">LESSON ROADMAP</div><div class="toc"><button data-action="jump-section" data-id="overview-${l.id}">01 · Understand</button><button data-action="jump-section" data-id="example-${l.id}">02 · Work through it</button><button data-action="jump-section" data-id="case-${l.id}">Production case</button><button data-action="jump-section" data-id="practice-${l.id}">Try the exercise</button><button data-action="jump-section" data-id="checkpoint-${l.id}">03 · Check understanding</button><button data-go="practice/${l.id}">04 · Defend & build</button></div></div><div class="rail-section rail-track"><div class="eyebrow">IN THIS TRACK</div><div class="rail-track-progress"><b>${esc(t.title)}</b><span>${position+1} / ${t.lessons.length}</span></div><div class="bar"><span style="width:${trackProgress(t).pct}%"></span></div><details class="rail-track-details"><summary>Other lessons</summary><div class="toc">${t.lessons.map((x,i)=>`<button data-go="lesson/${x.id}" class="${x.id===l.id?"current":""} ${progress.done.includes(x.id)?"done":""}">${i+1}. ${esc(x.title)}</button>`).join("")}</div></details></div><button class="rail-practice-link" data-go="practice/${l.id}">Practice this lesson <span>↗</span></button></nav></aside></div>`}
function interviewItem(q){const rated=progress.rated[q.id];return `<article class="question" data-qid="${q.id}"><div class="flex between"><div class="flex"><span class="tag">${esc(trackById.get(q.topic)?.title||q.topic)}</span><span class="tag">${esc(q.level)}</span></div><span class="tag ${rated==="ready"?"accent":""}">${rated==="ready"?"✓ Confident":rated==="review"?"↻ Review later":"Unattempted"}</span></div><h3>${esc(q.q)}</h3><div class="interview-toolbar"><button class="btn secondary small" data-action="toggle-answer" data-id="${q.id}">Show model answer ↓</button>${bookmarkBtn(q.id)}</div><div class="answer" id="answer-${q.id}"><b>INTERVIEW-READY ANSWER</b><p>${esc(q.answer)}</p><hr><b>INTERVIEWER FOLLOW-UP</b><p>${esc(q.followup)}</p><div class="flex"><button class="btn small" data-action="rate-answer" data-id="${q.id}" data-rating="ready">✓ I can explain this</button><button class="btn secondary small" data-action="rate-answer" data-id="${q.id}" data-rating="review">↻ Review later</button></div></div></article>`}
function filterBank(){let qs=bank;if(ui.topic!=="all")qs=qs.filter(q=>q.topic===ui.topic);if(ui.level!=="all")qs=qs.filter(q=>q.level===ui.level);const q=ui.search.trim().toLowerCase();if(q)qs=qs.filter(x=>(x.q+" "+x.answer+" "+x.followup).toLowerCase().includes(q));return qs}
function interviewList(){const qs=filterBank();return `<div class="muted tiny">${qs.length} answered questions found • ${bank.filter(q=>progress.rated[q.id]).length} self-assessed</div>${qs.length?qs.slice(0,ui.limit).map(interviewItem).join(""):`<div class="empty">No questions match these filters.</div>`}${qs.length>ui.limit?`<button class="btn secondary" data-action="more-questions">Load more questions (${Math.min(10,qs.length-ui.limit)} more) →</button>`:""}`}
function interviews(){
 return `<div class="journey-practice-header"><button class="journey-back" data-go="practice">← Practice</button><span class="journey-kicker">INTERVIEW PRACTICE / ${bank.length} QUESTIONS</span><h1>Explain it clearly.</h1><p>Answer aloud first. Reveal the model answer, identify weak points, then practice the follow-up.</p></div>
 <div class="filters"><input class="field search" id="interview-search" placeholder="Find a concept or question…" value="${esc(ui.search)}" aria-label="Search interview questions">
 <select class="field" id="interview-topic"><option value="all">All topics</option>${tracks.map(t=>`<option value="${t.id}" ${t.id===ui.topic?"selected":""}>${esc(t.title)}</option>`).join("")}</select>
 <select class="field" id="interview-level">${["all","Core","Deep dive","Senior scenario"].map(v=>`<option value="${v}" ${v===ui.level?"selected":""}>${v==="all"?"All levels":v}</option>`).join("")}</select>
 <button class="btn secondary small" data-action="only-weak">Review list</button></div>
 <div id="question-list">${interviewList()}</div>`;
}
function labsPage(activeId){const l=labById.get(activeId)||labs[0];const results=ui.labResults&&ui.labResults.id===l.id?ui.labResults.results:null;return `<div class="journey-practice-header"><button class="journey-back" data-go="practice">← Practice</button>${heading("IMPLEMENTATION / BROWSER CODING","Build and test","Write code, run the included tests, and work through one challenge at a time.")}</div><div class="callout warn"><b>Browser-only practice environment</b><p>The worker is a learning convenience, not a secure multi-tenant code sandbox. It runs code you type in your own browser and can be terminated for timeouts. Never paste secrets.</p></div><div class="lesson-layout"><div><div class="card"><div class="eyebrow">${esc(l.topic)} · ${esc(l.difficulty)} · ${l.minutes} MIN</div><h2 style="margin-top:9px">${esc(l.title)}</h2><p>${esc(l.description)}</p><ul>${l.requirements.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="flex between"><b>Your solution (JavaScript)</b><span class="tiny muted">Saved in this browser</span></div><textarea class="editor" id="code-editor" spellcheck="false" aria-label="JavaScript code editor">${esc(progress.labDrafts[l.id]??l.starter)}</textarea><div class="flex" style="margin-top:12px"><button class="btn" data-action="run-lab">▶ Run ${l.tests.length} tests</button><button class="btn secondary" data-action="reset-lab">Reset starter</button><button class="btn ghost" data-action="hint-lab">Show hint</button><button class="btn ghost" data-action="solution-lab">${ui.labReveal?"Hide solution":"Show solution"}</button></div><div id="lab-hint">${ui.labHint>0?`<div class="callout"><b>Hint ${ui.labHint} of ${l.hints.length}</b><p>${esc(l.hints[Math.min(ui.labHint-1,l.hints.length-1)])}</p></div>`:""}</div><div id="lab-results">${results?`<div class="console ${results.every(x=>x.pass)?"pass":"fail"}">${results.map(x=>(x.pass?"✓ PASS  ":"✗ FAIL  ")+x.name+(x.error?" — "+x.error:"")).join("\n")}\n\n${results.filter(x=>x.pass).length}/${results.length} tests passed${results.every(x=>x.pass)?" · ✓ Challenge completed":""}</div>`:`<div class="console muted">Click “Run tests” to execute your solution. Tests are shown after execution.</div>`}</div>${ui.labReveal?`${codeBlock("Reference solution",l.solution)}<div class="callout success"><b>Explanation & complexity</b><p>${esc(l.explanation)}</p></div>`:""}</div></div><aside class="lesson-aside"><div class="card"><div class="eyebrow">CHALLENGE LIBRARY</div><div class="toc">${labs.map((x,i)=>`<button data-go="labs/${x.id}" class="${l.id===x.id?"current":""} ${progress.labPassed[x.id]?"done":""}">${String(i+1).padStart(2,"0")}. ${esc(x.title)} <span class="tiny muted">· ${esc(x.difficulty)}</span></button>`).join("")}</div></div></aside></div>`}
function foundationPathPage(){
 const focus=learningPath("foundations");
 const done=days.filter((d,i)=>progress.dayDone.includes(i)).length;
 const current=days.findIndex((d,i)=>!progress.dayDone.includes(i));
 const i=current<0?days.length-1:current;
 const next=days[i].ids.map(id=>lessonById.get(id)).find(l=>l&&!progress.done.includes(l.id))||lessonById.get(days[i].ids[0]);
 return `<div class="journey-page journey-plan"><button class="journey-back" data-go="learn">← All learning paths</button>
 <header class="journey-plan-header"><span class="journey-eyebrow"><span class="journey-dot journey-dot--foundations"></span> FOCUSED REVISION · 8 DAYS</span>
 <h1>Fullstack Foundations.</h1><p>High-value JavaScript, React, TypeScript, architecture and interview practice, without repeating material you already know.</p>
 <div class="journey-plan-meter"><div class="journey-progress-track"><span style="width:${Math.round(done/days.length*100)}%"></span></div><span>${done}/${days.length} days reviewed</span></div>
 <div class="journey-plan-actions"><button class="btn journey-primary" data-go="lesson/${next.id}">Continue: ${esc(next.title)} ↗</button><button class="journey-subtle-link" data-go="practice/${next.trackId}">Practice this concept ↗</button></div></header>
 <section class="journey-plan-outline"><div class="journey-section-label"><span class="journey-kicker">YOUR REVISION MAP</span><h2>One focused day at a time.</h2><p>Each day pairs core topics with one short implementation challenge.</p></div>
 ${days.map((d,j)=>`<details class="journey-week ${j===i?"is-current":""} ${progress.dayDone.includes(j)?"is-complete":""}" ${j===i?"open":""}>
 <summary><span class="journey-week-index">${String(j+1).padStart(2,"0")}</span><div><span class="journey-minor">${progress.dayDone.includes(j)?"REVIEWED":j===i?"CURRENT DAY":"COMING UP"}</span><h3>${esc(d.theme)}</h3></div><span class="journey-week-progress">${d.ids.filter(id=>progress.done.includes(id)).length}/${d.ids.length} lessons</span><span class="journey-week-chevron">⌄</span></summary>
 <div class="journey-week-detail"><div><span class="journey-minor">01 / LEARN</span>${d.ids.map(id=>{const l=lessonById.get(id);return l?`<button class="journey-week-link" data-go="lesson/${id}"><span class="journey-check">${progress.done.includes(id)?"✓":"○"}</span><span>${esc(l.title)}</span><span class="journey-row-arrow">↗</span></button>`:""}).join("")}</div>
 <div><span class="journey-minor">02 / APPLY</span><button data-go="labs/${d.lab}" class="journey-week-link"><span class="journey-check">⌘</span><span>Complete coding challenge</span><span class="journey-row-arrow">↗</span></button>
 <p class="journey-week-outcome">${esc(d.goal)}</p><button class="journey-mark-day" data-action="journey-day-done" data-index="${j}">${progress.dayDone.includes(j)?"✓ Marked reviewed · undo":"Mark this day reviewed"}</button></div></div>
 </details>`).join("")}</section></div>`;
}
function planPage(){const d=days[ui.day];return `${heading("FRONTEND + FULLSTACK · 8 DAYS","Fullstack refresher sprint","The 8-day sequence emphasizes high-frequency topics. Complete lessons in order; practice coding and verbal answers every day. Full capstone work is optional.")}<div class="plan-cinematic"><div class="plan-graphic">${V.artwork("system",{type:"plan"})}</div><div class="plan-copy"><span class="eyebrow">8 DAYS / 11 SPECIALTIES / 1 GOAL</span><h2>Your route to interview confidence.</h2><p>We combine concise learning with implementations, architecture reasoning and resume defense. Study one day at a time.</p><div class="plan-progress-badge">${V.ring(Math.round(progress.dayDone.length/8*100))}<span>${progress.dayDone.length} / 8 days finished</span></div></div></div><div class="steps">${days.map((x,i)=>`<button class="day-card ${ui.day===i?"active":""}" data-action="select-day" data-index="${i}"><div class="eyebrow">DAY ${i+1}</div><h3>${esc(x.theme)}</h3><p>${x.ids.filter(id=>progress.done.includes(id)).length}/${x.ids.length} lessons complete</p><div class="bar"><span style="width:${100*x.ids.filter(id=>progress.done.includes(id)).length/x.ids.length}%"></span></div></button>`).join("")}</div><div class="grid2"><div><div class="section-title"><h2>Day ${ui.day+1}: ${esc(d.theme)}</h2></div><div class="card"><div class="eyebrow">TODAY'S LESSONS</div>${d.ids.map((id,i)=>{const l=lessonById.get(id);return `<div class="module-row" style="padding:14px 0;border-bottom:1px solid var(--border)"><div class="flex between"><div><b>${i+1}. ${esc(l.title)}</b><p class="tiny" style="margin:3px 0">${esc(l.trackTitle)} · ${l.minutes} min ${progress.done.includes(id)?"· ✓ Mastered":""}</p></div><button class="btn secondary small" data-go="lesson/${l.id}">Open →</button></div></div>`}).join("")}<hr><b>Implementation practice</b><p>${esc(labById.get(d.lab)?.title||"Practice implementation")}</p><button class="btn secondary" data-go="labs/${d.lab}">Open coding lab →</button></div></div><div><div class="section-title"><h2>Today's interview goal</h2></div><div class="card"><p style="color:#d6e2f7">${esc(d.goal)}</p><hr><div class="eyebrow">ACTIVE RECALL</div><ol><li>Close the article and explain 3 core ideas aloud.</li><li>Do the coding exercise before revealing the model solution.</li><li>Answer 8–12 questions from the interview bank.</li><li>Write one resume story with an alternative and trade-off.</li></ol><hr><label class="flex"><input type="checkbox" data-action="day-done" data-index="${ui.day}" ${progress.dayDone.includes(ui.day)?"checked":""}> Day ${ui.day+1} practice complete</label></div><div class="card" style="margin-top:16px"><div class="eyebrow">TIME BUDGET</div><p>Approx. 4–5 focused hours for a full day. If you have only 20 hours per week, spread this eight-day sprint across two weeks rather than rushing.</p></div></div></div>`}
function mocksPage(index){const idx=Number.isInteger(index)&&index>=0&&index<mocks.length?index:0;const m=mocks[idx];const checked=progress.mockRubrics[idx]||[];return `<div class="journey-practice-header"><button class="journey-back" data-go="practice">← Practice</button>${heading("SIMULATIONS / SENIOR ENGINEER","Defend your decisions","Reason through a realistic scenario, then review your answer against an explicit rubric. Scoring is self-assessed.")}</div><div class="pillbar">${mocks.map((x,i)=>`<button data-go="mocks/${i}" class="${i===idx?"active":""}">${i+1}. ${esc(x.kind.split(" · ")[0])}</button>`).join("")}</div><div class="card"><div class="eyebrow">${esc(m.kind)}</div><h2 style="margin-top:14px">${esc(m.title)}</h2><p style="font-size:17px;color:#d6e4fa">${esc(m.prompt)}</p><div class="flex"><button class="btn secondary small" data-action="mock-timer" data-index="${idx}">⏱ ${ui.mockSeconds?`${Math.floor(ui.mockSeconds/60)}:${String(ui.mockSeconds%60).padStart(2,"0")}`:"Start 2-min timer"}</button><span class="tag">Answer out loud first</span></div><hr><h3>Draft your response</h3><textarea class="textarea" id="mock-answer" data-save-mock="${idx}" placeholder="Start with requirements, then explain architecture and trade-offs…">${esc(progress.mockAnswers[idx]||"")}</textarea><p class="tiny muted">Autosaved locally. AI scoring is not connected.</p><hr><div class="eyebrow">INTERVIEWER FOLLOW-UP</div><h3 style="margin-top:12px">${esc(m.followup)}</h3><hr><h3>Review rubric</h3><p>Score yourself only when you can substantiate each point.</p><div class="rubric-grid">${m.rubric.map((x,i)=>`<label class="rubric-item"><input type="checkbox" data-action="mock-rubric" data-index="${idx}" data-item="${i}" ${checked.includes(i)?"checked":""}>${esc(x)}</label>`).join("")}</div><div class="callout"><b>Rubric: ${checked.length} / ${m.rubric.length} covered</b><p>Target all five criteria and be specific about trade-offs. Missing points tell you which topic to revisit.</p></div><button class="btn secondary" data-action="toggle-mock-sample">${ui.showSample?"Hide answer outline":"Reveal a strong answer structure"}</button>${ui.showSample?`<div class="callout success"><b>Answer structure (not a fake scripted answer)</b><p>${esc(m.outline)}</p></div>`:""}</div>`}
function dueQuestions(){const now=Date.now();const r=bank.filter(q=>!progress.rated[q.id]||progress.rated[q.id]==="review"||progress.rated[q.id+"_due"]<=now);return r.length?r:bank}
function flashcards(){const cards=dueQuestions();ui.flashIndex=Math.min(ui.flashIndex,cards.length-1);const q=cards[ui.flashIndex];return `<div class="journey-practice-header"><button class="journey-back" data-go="practice">← Practice</button>${heading("ACTIVE RECALL / REVISION","What do you remember?","Test your answer before flipping. Mark uncertain topics for another attempt.")}</div><div class="flex between"><span class="tag">${ui.flashIndex+1} / ${cards.length} cards in queue</span><span class="tag">${Object.values(progress.rated).filter(x=>x==="review").length} need review</span></div><div class="flashcard" data-action="flip-card" role="button" tabindex="0"><div class="flashcard-backdrop">${V.artwork(q.topic,{type:"flash"})}</div><div class="eyebrow">${esc(trackById.get(q.topic)?.title||q.topic)} · ${ui.flipped?"MODEL ANSWER":"INTERVIEW QUESTION"}</div><h2>${ui.flipped?esc(q.answer):esc(q.q)}</h2><span class="tiny muted">${ui.flipped?"Click to flip back":"Click to reveal answer"}</span></div><div class="flex between"><button class="btn secondary" data-action="prev-card">← Previous</button><div class="flex"><button class="btn ghost" data-action="grade-card" data-rating="review">Again</button><button class="btn" data-action="grade-card" data-rating="ready">I know this ✓</button></div><button class="btn secondary" data-action="next-card">Next →</button></div><div class="callout"><b>Follow-up to try</b><p>${esc(q.followup)}</p></div>`}
function projectsPage(){
 return `<div class="journey-page journey-projects"><header class="journey-page-intro"><span class="journey-kicker">PROJECTS / PROVE WHAT YOU LEARNED</span><h1>Build something real.</h1><p>Choose one capstone that demonstrates your engineering judgment. Your project is the evidence behind your interview answers.</p></header>
 <div class="journey-project-list">${projects.map((p,i)=>`<details class="journey-project">
 <summary><span class="journey-path-glyph journey-path-glyph--${p.id==="sop"?"ai":"backend"}">${String(i+1).padStart(2,"0")}</span><div><span class="journey-minor">${esc(p.level)} · ${esc(p.duration)}</span><h2>${esc(p.title)}</h2><p>${esc(p.problem)}</p><small>${esc(p.stack)}</small></div><span class="journey-row-arrow">⌄</span></summary>
 <div class="journey-project-detail"><div><h3>What you'll build</h3><ul>${p.deliverables.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div><h3>How you'll prove it works</h3><ul>${p.criteria.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p class="journey-project-interview"><b>Interview defense</b> · ${esc(p.interview)}</p></div></div></details>`).join("")}</div>
 <footer class="journey-plan-footer"><button data-go="learn">Review learning paths ↗</button><button data-go="practice">Practice defending architecture ↗</button></footer>
 </div>`;
}


const diagrams=[{"id":"request","name":"End-to-end request lifecycle","topic":"Fullstack foundations","summary":"Track one authenticated dashboard read from browser to database and back. Each boundary is a potential latency or security failure.","nodes":[{"title":"Browser","desc":"User opens a report route. Browser requests HTML/data, holds short-lived UI state and sends credentials according to the session strategy.","risk":"Never trust client-provided tenantId or role. The browser controls request inputs."},{"title":"Next.js UI","desc":"The route decides server/client component boundaries, loads authorized data and streams or renders UI according to version-specific framework behavior.","risk":"Beware shared caching of personalized data and hydration mismatches."},{"title":"Node API","desc":"Middleware authenticates, validates params, authorizes the exact resource and records a request trace. Handler delegates to domain logic.","risk":"A successful login does not authorize another patient's report; enforce object-level checks."},{"title":"PostgreSQL","desc":"Parameterized queries read or mutate data under constraints and tenant scope. Relevant indexes shorten selective operations.","risk":"N+1 queries, missing composite indexes and concurrency races increase tail latency or violate integrity."},{"title":"Response & RUM","desc":"Serialize only safe DTO fields. Browser renders the result while traces and Real User Monitoring capture latency and UX.","risk":"Do not leak hashes/tokens by blindly serializing ORM objects. Compare field p75 and backend p95."}],"question":"Where should authorization run if a report is requested directly from the API without loading the frontend first?"},{"id":"event","name":"JavaScript event loop","topic":"JavaScript Internals","summary":"Why synchronous logs beat Promise callbacks, which beat zero-delay timers. Use this diagram to predict real console output.","nodes":[{"title":"Call stack","desc":"Run synchronous statements until current JavaScript execution finishes. A blocking while loop prevents the rest from running.","risk":"A promise callback is not allowed to interrupt a synchronous stack."},{"title":"Microtask queue","desc":"Promise.then, await continuations and queueMicrotask callbacks run after current synchronous work and before a new task.","risk":"Microtasks queued by microtasks run before the next timer; infinite chains can starve timers."},{"title":"Task queue","desc":"Timers, user input dispatch and other task callbacks execute on subsequent event-loop turns depending on host scheduling.","risk":"setTimeout(...,0) does not guarantee immediate execution or exact timing."},{"title":"Render opportunity","desc":"Browsers may update layout/paint between tasks, subject to scheduling. A long synchronous task hurts responsiveness.","risk":"Promises and timers do not make CPU-bound browser JavaScript parallel."}],"question":"Given sync log A, timer B, Promise C and sync log D, why does output become A D C B?"},{"id":"micro","name":"Next.js microfrontend architecture","topic":"Your resume — healthcare migration","summary":"Visualize a shared shell with separately owned business frontends and contract boundaries.","nodes":[{"title":"Shared shell","desc":"Own navigation, design tokens, common error handling, authentication integration and telemetry entry points.","risk":"A shell change can break every module; use contracts and gradual rollout."},{"title":"Diagnostics","desc":"A product-slice module owns diagnostic workflows, routes and feature logic; it integrates through versioned shell contracts.","risk":"Avoid importing server-only/PHI data across uncontrolled module interfaces."},{"title":"Reports","desc":"Private report module owns patient view components and API calls, with authorization enforced by trusted services.","risk":"Do not rely on a hidden menu item or frontend-only role check."},{"title":"Fleet/Operations","desc":"Another module can deploy independently while reusing shared navigation and observability conventions.","risk":"Independent deployability requires dependency and routing compatibility."},{"title":"CI / rollout","desc":"Build and test modules, run contract checks, deploy to cohorts and roll back an individual remote where possible.","risk":"Watch for bundle duplication, CSS conflicts and incompatible library versions."}],"question":"Why were microfrontends preferable to a modular monolith in the real organization? What did they cost?"},{"id":"sql","name":"Transaction and idempotency","topic":"PostgreSQL + API correctness","summary":"Trace a safe inventory or signup mutation with atomic database constraints.","nodes":[{"title":"Validate","desc":"Authenticate, authorize and validate the request. Parse a client idempotency key if the operation may be retried.","risk":"Frontend duplicate-submit prevention does not stop parallel API requests."},{"title":"Begin transaction","desc":"Start a scoped DB transaction around mutations that must succeed or fail together.","risk":"Do not keep the transaction open while waiting on unrelated network calls."},{"title":"Guarded write","desc":"Use UNIQUE constraints and conditional updates to arbitrate races. Read affected-row count or conflict outcome.","risk":"SELECT then INSERT without a unique constraint creates a check-then-write race."},{"title":"Commit / rollback","desc":"Commit all valid changes or roll back on failure. Retry whole transactions only for known transient DB errors.","risk":"A rollback cannot retract an external email/payment side effect."},{"title":"Outbox event","desc":"Persist an event record transactionally and publish asynchronously; consumers deduplicate at-least-once deliveries.","risk":"Publishing to a broker before commit can send events for DB writes that later roll back."}],"question":"Two requests register the same email at once. Which system decides the winner and why?"},{"id":"socket","name":"Real-time fleet tracking","topic":"WebSockets + system design","summary":"From GPS telemetry to authorized maps, with durable storage separated from live fanout.","nodes":[{"title":"GPS devices","desc":"Vehicles send signed location events with vehicle ID, sequence and timestamp. At 50k devices every five seconds, ingest is ~10k events/sec.","risk":"Coordinates can arrive late or be replayed; validate identity, order and age."},{"title":"Ingestion","desc":"Receive and validate events, limit abuse and forward to a partitioned stream or durable ingest pipeline.","risk":"Avoid blocking ingest on slow dashboard subscribers."},{"title":"Current + history","desc":"Maintain an authoritative latest location separately from retained movement history for replay/analytics.","risk":"Do not rely on WebSocket clients as a historical record."},{"title":"Pub/Sub","desc":"Distribute fleet-scoped deltas across WebSocket server instances, throttling/coalescing where useful.","risk":"A single process connection map cannot broadcast across a horizontal fleet of servers."},{"title":"Dashboard","desc":"Authenticate fleet subscriptions, render markers, reconnect with backoff and fetch a snapshot after gaps.","risk":"Show stale last-seen states, enforce tenancy and prevent slow clients from growing buffers forever."}],"question":"How do you scale from 100 to 50,000 vehicles without assuming every update must go to every viewer?"},{"id":"langgraph","name":"Auditable LangGraph SOP review","topic":"AI systems and human oversight","summary":"A controlled state graph for regulatory document review, evidence validation and human approval.","nodes":[{"title":"Versioned SOP","desc":"Ingest documents with versions, section IDs, extraction validation and per-tenant permissions.","risk":"Malformed extraction and table layout errors can hide important rules."},{"title":"Retrieve evidence","desc":"Fetch source sections using metadata-aware retrieval and optionally rerank. Keep provenance IDs and text spans.","risk":"Retrieved pages can contain prompt-injection instructions; they are data, not policy."},{"title":"Evaluate","desc":"Use deterministic rules when possible; call the model for ambiguous language and require structured findings.","risk":"Structured JSON validity does not establish factual truth or legal compliance."},{"title":"Evidence gate","desc":"Validate source references, required fields, risk and ambiguity. Fail closed or escalate when evidence is missing.","risk":"Never let invented citations or model self-confidence authorize high-risk changes."},{"title":"Human + audit","desc":"Pause for an authorized reviewer, persist decisions/checkpoints, and log document/model/prompt versions.","risk":"Track reviewer overrides, false approvals and auditability, not just manual time saved."}],"question":"What happens when a required clause cannot be retrieved and the model claims the document is compliant?"}];
function diagramPage(){
const d=diagrams.find(x=>x.id===ui.diagram)||diagrams[0],idx=Math.max(0,Math.min(d.nodes.length-1,Number(ui.diagramNode)||0)),n=d.nodes[idx];
return `<div class="journey-practice-header"><button class="journey-back" data-go="learn">← Learning paths</button>${heading("SYSTEM DESIGN / VISUAL MAPS","Trace the architecture","Walk through the flow, identify responsibilities and defend failure cases.")}</div>
<div class="pillbar">${diagrams.map(x=>`<button data-action="select-diagram" data-id="${x.id}" class="${d.id===x.id?"active":""}">${esc(x.name)}</button>`).join("")}</div>
<div class="card"><div class="eyebrow">${esc(d.topic)}</div><h2 style="margin:11px 0">${esc(d.name)}</h2><p>${esc(d.summary)}</p><div class="architecture-illustration">${V.architecture(d.nodes,idx)}</div><div class="system-flow">${d.nodes.map((node,i)=>`${i>0?'<div class="system-arrow" aria-hidden="true">→</div>':""}<button class="system-node ${i===idx?"active":""}" data-action="select-node" data-index="${i}"><small>STEP ${i+1}</small><b>${esc(node.title)}</b><span>View boundary →</span></button>`).join("")}</div><div class="diagram-detail"><div class="eyebrow">SELECTED BOUNDARY · ${idx+1}/${d.nodes.length}</div><h3>${esc(n.title)}</h3><p>${esc(n.desc)}</p><div class="callout warn"><b>Risk / interview follow-up</b><p>${esc(n.risk)}</p></div><div class="flex between"><button class="btn secondary small" data-action="select-node" data-index="${(idx-1+d.nodes.length)%d.nodes.length}">← Previous boundary</button><button class="btn small" data-action="select-node" data-index="${(idx+1)%d.nodes.length}">Next boundary →</button></div></div></div><div class="card" style="margin-top:17px"><div class="eyebrow">EXPLAIN THIS ALOUD</div><h3 style="margin-top:11px">${esc(d.question)}</h3><p>Try a 90-second answer that covers constraints, data flow, bottlenecks, failure behavior and trade-offs. Then defend it during a mock interview.</p><button class="btn secondary" data-go="mocks">Open mock interviews →</button></div>`;
}
function notFound(){return `<div class="card"><h1>Page not found</h1><p>That lesson or section does not exist.</p><button class="btn" data-go="dashboard">Return to overview</button></div>`}
function render(){const path=getLocation().split("/");const directPath=(path[0]==="backend"||path[0]==="aws")?"backend":path[0]==="ai-path"?"ai":path[0]==="plan"?"foundations":null;if(directPath&&progress.activePath!==directPath){progress.activePath=directPath;save()}let html="",name="Overview / Dashboard";switch(path[0]){case "dashboard":html=dashboard();break;case "learn":html=learnPage();name="Learn";break;case "practice":html=practicePage(path[1]);name="Practice";break;case "aws":html=awsPathPage();name="Learning / AWS architecture";break;case "aws-lab":html=awsLabPage(path[1]);name="Build & Prove / AWS lab";break;case "backend":html=backendPathPage();name="Learning / Backend pathway";break;case "backend-lab":html=backendLabPage(path[1]);name="Practice / Backend workshop";break;case "ai-path":html=aiPathPage();name="Learning / AI Engineering";break;case "ai-lab":html=aiLabPage(path[1]);name="Practice / AI Workshop";break;case "curriculum":html=curriculum();name="Learning / Curriculum";break;case "track":html=trackPage(path[1]);name="Learning / Track";break;case "lesson":ui.lessonReveal=false;if(lessonById.has(path[1])&&progress.lastStudiedLessonId!==path[1]){progress.lastStudiedLessonId=path[1];save()}html=lessonPage(path[1]);name="Learning / "+(lessonById.get(path[1])?.title||"Lesson");break;case "plan":html=foundationPathPage();name="Learn / Fullstack foundations";break;case "interviews":html=interviews();name="Practice / Interview bank";break;case "labs":html=labsPage(path[1]);name="Practice / Coding lab";break;case "mocks":html=mocksPage(Number(path[1]||0));name="Practice / Mock interview";break;case "flashcards":html=flashcards();name="Practice / Revision cards";break;case "projects":html=projectsPage();name="Build / Capstone projects";break;case "diagrams":html=diagramPage();name="Learning / Architecture maps";break;default:html=notFound()}document.getElementById("app").className="screen route-"+path[0];document.getElementById("app").innerHTML=html;document.getElementById("breadcrumb").textContent=name;document.querySelectorAll(".nav button").forEach(b=>{const section=["learn","curriculum","backend","ai-path","plan","track","lesson","diagrams","aws"].includes(path[0])?"learn":["practice","interviews","labs","mocks","flashcards","backend-lab","ai-lab","aws-lab"].includes(path[0])?"practice":path[0];b.classList.toggle("active",b.dataset.route===section)});document.getElementById("sidebar").classList.remove("open");syncSidebar();document.body.classList.toggle("light",progress.theme==="light");
const themeButton=document.getElementById("theme-btn");
if(themeButton){
  const toLight=progress.theme!=="light";
  themeButton.textContent=toLight?"☀ Light mode":"☾ Dark mode";
  themeButton.title=toLight?"Switch to light mode":"Switch to dark mode";
  themeButton.setAttribute("aria-label",themeButton.title);
  themeButton.setAttribute("aria-pressed",String(progress.theme==="light"));
}
const themeMeta=document.querySelector('meta[name="theme-color"]');
if(themeMeta)themeMeta.setAttribute("content",progress.theme==="light"?"#fafaf7":"#10191b");}
const app=document.getElementById("app");
app.addEventListener("click",async e=>{
const target=e.target.closest("[data-go],[data-action]");if(!target)return;
if(target.dataset.go){go(target.dataset.go);return}
const act=target.dataset.action,id=target.dataset.id,idx=Number(target.dataset.index);
if(act==="choose-path"){if(!["backend","ai","foundations"].includes(id))return;progress.activePath=id;save();go(learningPath(id).route);return}
if(act==="aws-lab-done"){if(!AWS_WORKSHOP.labs.some(x=>x.id===id))return;progress.awsLabDone=progress.awsLabDone.includes(id)?progress.awsLabDone.filter(x=>x!==id):[...progress.awsLabDone,id];save();render();return}
if(act==="study-questions"){ui.topic=trackById.has(id)?id:"all";ui.search="";ui.limit=10;go("interviews");return}
if(act==="practice-grade"){if(!bank.some(q=>q.id===id))return;const rating=target.dataset.rating==="ready"?"ready":"review";progress.rated[id]=rating;progress.rated[id+"_due"]=Date.now()+(rating==="ready"?3*864e5:0);save();const buttons=target.closest(".practice-evaluation")?.querySelectorAll?.("button");buttons?.forEach(b=>b.classList.toggle("is-selected",b.dataset.rating===rating));const status=document.querySelector(".practice-attempt-status");if(status)status.textContent=rating==="ready"?"RECALLED":"REVISIT LATER";showToast(rating==="ready"?"Marked confident":"Added to revision");return}
if(act==="journey-day-done"){progress.dayDone=progress.dayDone.includes(idx)?progress.dayDone.filter(x=>x!==idx):[...progress.dayDone,idx];save();render();return}

if(act==="source-next"||act==="source-prev"||act==="source-jump"){
 const carousel=target.closest(".source-carousel");
 if(act==="source-jump")setSourceSlide(carousel,idx);
 else moveSourceSlide(carousel,act==="source-next"?1:-1);
 return;
}
if(act==="select-diagram"){ui.diagram=id;ui.diagramNode=0;render()}
if(act==="select-node"){ui.diagramNode=idx;render()}
if(act==="jump-section"){const section=document.getElementById(id);if(section)section.scrollIntoView({behavior:"smooth",block:"start"});return}
if(act==="ai-lab-done"){progress.aiLabDone=progress.aiLabDone.includes(id)?progress.aiLabDone.filter(x=>x!==id):[...progress.aiLabDone,id];save();render();showToast(progress.aiLabDone.includes(id)?"AI mission self-verified":"AI mission marked incomplete");return}
if(act==="backend-lab-done"){progress.backendLabDone=progress.backendLabDone.includes(id)?progress.backendLabDone.filter(x=>x!==id):[...progress.backendLabDone,id];save();render();showToast(progress.backendLabDone.includes(id)?"Marked self-verified":"Mission marked incomplete");return}
if(act==="copy-interview"){const answer=COURSE_DEPTH[id]?.interview||"";try{await navigator.clipboard.writeText(answer);showToast("Interview answer copied")}catch{showToast("Could not access clipboard")}return}
if(act==="copy-code"){const code=target.closest(".code-wrap")?.querySelector("code")?.textContent||"";try{await navigator.clipboard.writeText(code);showToast("Code copied")}catch{showToast("Clipboard permission denied")}}
if(act==="bookmark"){progress.bookmarks=progress.bookmarks.includes(id)?progress.bookmarks.filter(x=>x!==id):[...progress.bookmarks,id];save();target.textContent=progress.bookmarks.includes(id)?"★ Bookmarked":"☆ Bookmark"}
if(act==="toggle-lesson-solution"){ui.lessonReveal=!ui.lessonReveal;const el=document.getElementById("lesson-solution");el.hidden=!ui.lessonReveal;target.textContent=ui.lessonReveal?"Hide worked answer":"Reveal worked answer"}
if(act==="answer-check"){const l=lessonById.get(id);progress.checks[id]=idx;save();const current=getLocation();const note=document.getElementById("lesson-notes");if(note)progress.notes[id]=note.value;save();render();if(current===getLocation()){const box=document.querySelector(".knowledge");box?.scrollIntoView({block:"nearest",behavior:"smooth"})}if(idx===l.check.correct)showToast("Checkpoint passed! You can mark this lesson mastered.")}
if(act==="complete-lesson"){const l=lessonById.get(id);if(!l||progress.checks[id]!==l.check.correct){showToast("Pass the checkpoint first");return}if(!progress.done.includes(id))progress.done.push(id);progress.lastCompletedLessonId=id;save();render();showToast("Checkpoint complete. Practice your explanation next.")}
if(act==="toggle-answer"){const el=document.getElementById("answer-"+id);el.classList.toggle("show");target.textContent=el.classList.contains("show")?"Hide model answer ↑":"Show model answer ↓"}
if(act==="rate-answer"){progress.rated[id]=target.dataset.rating;progress.rated[id+"_due"]=Date.now()+(target.dataset.rating==="ready"?3*864e5:0);save();target.closest(".answer")?.classList.remove("show");const badge=target.closest(".question")?.querySelector(".tag:last-child");if(badge)badge.textContent=target.dataset.rating==="ready"?"✓ Confident":"↻ Review later";showToast("Added to your revision history")}
if(act==="more-questions"){ui.limit+=10;document.getElementById("question-list").innerHTML=interviewList()}
if(act==="only-weak"){ui.search="";ui.topic="all";ui.level="all";ui.limit=10;const searchInput=document.getElementById("interview-search");if(searchInput)searchInput.value="";const weak=bank.filter(q=>progress.rated[q.id]==="review");if(!weak.length){showToast("No review-marked questions yet");return}document.getElementById("question-list").innerHTML=weak.map(interviewItem).join("");showToast("Showing questions marked for review")}
if(act==="run-lab")await runLab();
if(act==="reset-lab"){const l=labById.get(getLocation().split("/")[1])||labs[0];document.getElementById("code-editor").value=l.starter;progress.labDrafts[l.id]=l.starter;ui.labResults=null;save();document.getElementById("lab-results").innerHTML='<div class="console">Editor reset. Run tests when ready.</div>'}
if(act==="hint-lab"){const l=labById.get(getLocation().split("/")[1])||labs[0];ui.labHint=Math.min(ui.labHint+1,l.hints.length);document.getElementById("lab-hint").innerHTML=`<div class="callout"><b>Hint ${ui.labHint} of ${l.hints.length}</b><p>${esc(l.hints[ui.labHint-1])}</p></div>`}
if(act==="solution-lab"){ui.labReveal=!ui.labReveal;const l=labById.get(getLocation().split("/")[1])||labs[0];if(ui.labReveal){const area=document.getElementById("lab-results");area.insertAdjacentHTML("afterend",`<div id="lab-solution">${codeBlock("Reference solution",l.solution)}<div class="callout success"><b>Why it works</b><p>${esc(l.explanation)}</p></div></div>`)}else document.getElementById("lab-solution")?.remove();target.textContent=ui.labReveal?"Hide solution":"Show solution"}
if(act==="select-day"){ui.day=idx;render()}
if(act==="day-done"){if(target.checked){if(!progress.dayDone.includes(idx))progress.dayDone.push(idx)}else progress.dayDone=progress.dayDone.filter(x=>x!==idx);save()}
if(act==="mock-rubric"){const n=Number(target.dataset.item);let arr=progress.mockRubrics[idx]||[];arr=target.checked?[...new Set([...arr,n])]:arr.filter(x=>x!==n);progress.mockRubrics[idx]=arr;save();const callout=target.closest(".card")?.querySelector(".callout b");if(callout)callout.textContent=`Rubric: ${arr.length} / ${mocks[idx].rubric.length} covered`}
if(act==="toggle-mock-sample"){ui.showSample=!ui.showSample;render()}
if(act==="mock-timer"){if(ui.mockTimer){clearInterval(ui.mockTimer);ui.mockTimer=null;showToast("Timer paused")}else{ui.mockSeconds=ui.mockSeconds||120;ui.mockTimer=setInterval(()=>{ui.mockSeconds--;const b=document.querySelector('[data-action="mock-timer"]');if(b)b.textContent=`⏱ ${Math.floor(ui.mockSeconds/60)}:${String(ui.mockSeconds%60).padStart(2,"0")}`;if(ui.mockSeconds<=0){clearInterval(ui.mockTimer);ui.mockTimer=null;ui.mockSeconds=0;showToast("Time. Give your conclusion and review the rubric.")}},1000)}}
if(act==="flip-card"){ui.flipped=!ui.flipped;render()}
if(act==="next-card"||act==="prev-card"){const n=dueQuestions().length;ui.flashIndex=(ui.flashIndex+(act==="next-card"?1:-1)+n)%n;ui.flipped=false;render()}
if(act==="grade-card"){const cards=dueQuestions(),q=cards[ui.flashIndex];progress.rated[q.id]=target.dataset.rating;progress.rated[q.id+"_due"]=Date.now()+(target.dataset.rating==="ready"?3*864e5:0);save();ui.flashIndex=Math.min(ui.flashIndex,dueQuestions().length-1);ui.flipped=false;render();showToast("Review schedule updated")}
});
app.addEventListener("input",e=>{const x=e.target;if(x.id==="interview-search"){ui.search=x.value;ui.limit=10;document.getElementById("question-list").innerHTML=interviewList()}if(x.dataset.saveNote){progress.notes[x.dataset.saveNote]=x.value;save()}if(x.dataset.saveMock!==undefined){progress.mockAnswers[x.dataset.saveMock]=x.value;save()}if(x.id==="code-editor"){const l=labById.get(getLocation().split("/")[1])||labs[0];progress.labDrafts[l.id]=x.value;save()}});
app.addEventListener("change",e=>{if(e.target.id==="interview-topic"){ui.topic=e.target.value;ui.limit=10;document.getElementById("question-list").innerHTML=interviewList()}if(e.target.id==="interview-level"){ui.level=e.target.value;ui.limit=10;document.getElementById("question-list").innerHTML=interviewList()}});
app.addEventListener("keydown",e=>{
 const sourceCarousel=e.target.closest(".source-carousel");
 if(sourceCarousel&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){
   e.preventDefault();
   moveSourceSlide(sourceCarousel,e.key==="ArrowRight"?1:-1);
   return;
 }
const target=e.target.closest('[role="link"],[data-action="flip-card"]');if(target&&(e.key==="Enter"||e.key===" ")){e.preventDefault();target.click()}if(e.target.id==="code-editor"&&e.key==="Tab"){e.preventDefault();const x=e.target,pos=x.selectionStart;x.value=x.value.slice(0,pos)+"  "+x.value.slice(x.selectionEnd);x.selectionStart=x.selectionEnd=pos+2;x.dispatchEvent(new Event("input",{bubbles:true}))}});
let sourceSwipeStart=null;
app.addEventListener("touchstart",e=>{
 const carousel=e.target.closest(".source-carousel");
 if(!carousel||e.touches.length!==1){sourceSwipeStart=null;return}
 sourceSwipeStart={carousel,x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
app.addEventListener("touchend",e=>{
 if(!sourceSwipeStart||!e.changedTouches.length)return;
 const {carousel,x,y}=sourceSwipeStart;
 sourceSwipeStart=null;
 if(!carousel.isConnected)return;
 const dx=e.changedTouches[0].clientX-x;
 const dy=e.changedTouches[0].clientY-y;
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){
   moveSourceSlide(carousel,dx<0?1:-1);
 }
},{passive:true});
function runLab(){return new Promise(resolve=>{const l=labById.get(getLocation().split("/")[1])||labs[0];const code=document.getElementById("code-editor")?.value||"";const container=document.getElementById("lab-results");container.innerHTML='<div class="console">Running tests in an isolated browser worker…</div>';const workerJs=`
self.onmessage=async function(e){
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 const results=[];
 for(const test of e.data.tests){
  try{
   const run=new AsyncFunction(e.data.code+"\\nreturn ("+test.expr+");");
   const pass=Boolean(await run());
   results.push({name:test.name,pass,error:pass?"":"Unexpected result"});
  }catch(err){results.push({name:test.name,pass:false,error:String(err.message||err).slice(0,200)})}
 }
 self.postMessage(results);
}`;
let worker,url,timer,settled=false;const finish=results=>{if(settled)return;settled=true;clearTimeout(timer);worker?.terminate();if(url)URL.revokeObjectURL(url);ui.labResults={id:l.id,results};const passed=results.every(x=>x.pass);if(passed){progress.labPassed[l.id]=true;save()}container.innerHTML=`<div class="console ${passed?"pass":"fail"}">${results.map(x=>(x.pass?"✓ PASS  ":"✗ FAIL  ")+esc(x.name)+(x.error?" — "+esc(x.error):"")).join("\n")}\n\n${results.filter(x=>x.pass).length}/${results.length} tests passed${passed?" · Challenge passed ✓":""}</div>`;if(passed)showToast("All tests passed. Nice work.");resolve(results)};
try{url=URL.createObjectURL(new Blob([workerJs],{type:"application/javascript"}));worker=new Worker(url);worker.onmessage=e=>finish(e.data);worker.onerror=e=>finish([{name:"Worker error",pass:false,error:e.message||"Worker error"}]);timer=setTimeout(()=>finish([{name:"Execution timeout",pass:false,error:"Stopped after 4.5 seconds (possible infinite loop)."}]),4500);worker.postMessage({code,tests:l.tests})}catch(err){finish([{name:"Browser worker unavailable",pass:false,error:String(err.message||err)}])}})}
document.querySelectorAll(".nav button").forEach(b=>b.addEventListener("click",()=>go(b.dataset.route)));
document.getElementById("menu-btn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("theme-btn").addEventListener("click",()=>{progress.theme=progress.theme==="dark"?"light":"dark";save();render()});
window.addEventListener("hashchange",()=>{if(ui.mockTimer){clearInterval(ui.mockTimer);ui.mockTimer=null;ui.mockSeconds=0}render();scrollTo(0,0)});
if(!location.hash)location.hash="dashboard";else render();
window.__courseDiagnostics={trackCount:tracks.length,lessonCount:lessons.length,questionCount:bank.length,labCount:labs.length,dayCount:days.length,version:"6.0.0",lessonPracticeHandoff:true,progressiveLessonStages:true,navigationSections:3,selectedLearningPath:progress.activePath,backendTrackCount:4,backendLabCount:WORKSHOP.labs.length,backendPathHours:WORKSHOP.hoursPerWeek*WORKSHOP.weeks.length,aiTrackCount:3,awsTrackCount:trackById.has("aws")?1:0,awsLabCount:AWS_WORKSHOP.labs.length,aiLabCount:AI_WORKSHOP.labs.length,aiPathHours:AI_WORKSHOP.hoursPerWeek*AI_WORKSHOP.weeks.length,expandedLessonCount:Object.keys(COURSE_DEPTH).length,curatedMediaLessons:EXTERNAL_MEDIA_COUNT};
})();
