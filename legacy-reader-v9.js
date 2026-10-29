/* Iteration 9: progressively disclose the existing 75 lessons without replacing their content.
 * The source text is authoritative; the learning map is NOT a system architecture diagram.
 * Each original ## chapter becomes a small independent recall topic.
 */
(function(){
"use strict";
const escape=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const textOnly=s=>String(s||"").replace(/\*\*|\*/g,"").replace(/`/g,"").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").trim();
const sentencePieces=s=>textOnly(s).replace(/\n[-*] /g,". ").replace(/\n/g," ").split(/(?<=[.!?])\s+(?=[A-Z(0-9])/).map(v=>v.trim()).filter(Boolean);
const titleCase=s=>String(s||"").replace(/^##\s*/,"").trim();
function topics(lesson){
 const chunks=String(lesson.theory||"").split(/(?=^##\s)/m).filter(x=>x.trim());
 return chunks.map((s,i)=>{
  const first=s.indexOf("\n"),hasHeading=s.startsWith("## ");
  const title=hasHeading?titleCase(first<0?s:s.slice(0,first)):(i===0?"Big picture":"Concept "+(i+1));
  const body=hasHeading&&first>=0?s.slice(first+1).trim():s.trim();
  return {id:"topic-"+(i+1),title,body,points:sentencePieces(body).slice(0,4)};
 });
}
const select=(lesson,id)=>topics(lesson).find(t=>t.id===id)||topics(lesson)[0];
const allReady=(lesson,ratings)=>topics(lesson).every(t=>ratings[lesson.id+"/"+t.id]?.rating==="ready");
const list=items=>'<ul class="c9-points">'+items.map(x=>'<li>'+escape(x)+'</li>').join("")+'</ul>';
const stages=[["try","Try"],["understand","Understand"],["implement","Apply"],["recall","Recall"],["finish","Finish"]];
const markup=(l,section,html,ctx)=>{
 const {state,stage,ratings,showAnswer,notes,originalHtml,completed,checked,next,bookmark}=ctx;
 const unitKey=l.id+"/"+section.id,entry=ratings[unitKey]||{},parts=topics(l),position=parts.findIndex(x=>x.id===section.id),mastered=parts.filter(t=>ratings[l.id+"/"+t.id]?.rating==="ready").length;
 const ready=allReady(l,ratings),due=Number.isFinite(entry.dueAt)?new Date(entry.dueAt).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"";
 const t=l.trackTitle;
 const nav=parts.map((part,i)=>'<button data-go="lesson/'+escape(l.id)+'/'+part.id+'" '+(part.id===section.id?'aria-current="step"':'')+'><span>'+String(i+1).padStart(2,"0")+'</span><b>'+escape(part.title)+'</b><span class="c9-status">'+(ratings[l.id+"/"+part.id]?.rating==="ready"?"✓":ratings[l.id+"/"+part.id]?.rating?"↻":"")+'</span></button>').join("");
 let body="";
 if(stage==="try"){
  body='<p class="c9-kicker">01 / QUESTION FIRST</p><h2>'+escape(section.title)+'</h2>'+
   '<p class="c9-lead">'+escape(l.check.q)+'</p><p class="c9-muted">Start by predicting the answer. Your explanation is private and saved on this device.</p>'+
   '<label for="c9-first">Explain what you already know <span>(optional)</span></label><textarea rows="4" id="c9-first" class="c9-input" data-c9-first="'+escape(unitKey)+'" placeholder="What would you say in an interview?">'+escape(entry.initialDraft||"")+'</textarea>'+
   '<div class="c9-actions"><button class="btn journey-primary" data-action="c9-stage" data-id="understand">Understand the idea →</button><button class="c9-quiet" data-action="c9-stage" data-id="recall">I already know this · test me</button></div>';
 }else if(stage==="understand"){
  const keyIdea=section.points[0]||"Read the full source in the Apply step.";
  body='<p class="c9-kicker">02 / HIGH-LEVEL EXPLANATION</p><h2>'+escape(section.title)+'</h2>'+list(section.points)+
   '<figure class="c9-mentalmap"><figcaption>Learning map · not a system architecture diagram</figcaption><ol><li><b>Goal</b><span>'+escape(l.goal)+'</span></li><li><b>Core idea</b><span>'+escape(keyIdea)+'</span></li><li><b>Apply it</b><span>'+escape(l.task)+'</span></li></ol></figure>'+
   '<div class="c9-actions"><button class="btn journey-primary" data-action="c9-stage" data-id="implement">Show the implementation →</button><button class="c9-quiet" data-action="c9-stage" data-id="try">← Question</button></div>';
 }else if(stage==="implement"){
  const process=sentencePieces(l.walkthrough||"").slice(0,4);
  body='<p class="c9-kicker">03 / WORK THROUGH IT</p><h2>Follow the process.</h2>'+
   (process.length?'<ol class="c9-process">'+process.map(x=>'<li>'+escape(x)+'</li>').join("")+'</ol>':'<p>'+escape(l.goal)+'</p>')+
   '<figure class="c9-code"><figcaption>Existing lesson implementation</figcaption><pre><code>'+escape(l.code||"")+'</code></pre></figure>'+
   '<details class="c9-details"><summary>Common production/interview trap</summary><p>'+escape(l.pitfall)+'</p></details>'+
   '<details class="c9-details"><summary>Complete reference · original teaching, diagrams, scenarios and solution</summary><div class="c9-reference">'+originalHtml+'</div></details>'+
   '<div class="c9-actions"><button class="btn journey-primary" data-action="c9-stage" data-id="recall">Hide it & explain from memory →</button><button class="c9-quiet" data-action="c9-stage" data-id="understand">← Big picture</button></div>';
 }else if(stage==="recall"){
  body='<p class="c9-kicker">04 / SHADOW STUDY · CLOSED BOOK</p><h2>Explain '+escape(section.title)+'.</h2>'+
   '<p class="c9-muted">Code, explanations and reference material are hidden. Explain the mechanism in your own words before comparing.</p>'+
   '<label for="c9-answer">Your explanation</label><textarea id="c9-answer" class="c9-input" rows="5" data-c9-recall="'+escape(unitKey)+'" placeholder="Describe what happens and why…">'+escape(entry.draft||"")+'</textarea>'+
   '<div class="c9-actions"><button class="btn journey-primary" data-action="c9-compare">Compare with key points</button><button class="c9-quiet" data-action="c9-stage" data-id="implement">Review explanation</button></div>'+
   (showAnswer?'<section class="c9-compare"><h3>Key points from the lesson</h3>'+list(section.points)+'<p class="c9-muted">Self-assess; this is not an automated correctness judgment.</p><div class="c9-ratings"><button data-action="c9-rate" data-rating="again">Missed it · 1 day</button><button data-action="c9-rate" data-rating="partial">Partly recalled · 3 days</button><button data-action="c9-rate" data-rating="ready">Explained well · 7 days</button></div></section>':'');
 }else {
  body='<p class="c9-kicker">05 / CHECK YOUR UNDERSTANDING</p><h2>'+escape(mastered)+' of '+parts.length+' topics confidently recalled.</h2>'+
   (entry.rating?'<p class="c9-muted">Last self-rating: '+escape(entry.rating)+'. '+(due?'Review on '+escape(due)+'.':'')+'</p>':'<p class="c9-muted">Recall this topic without notes to add it to your review schedule.</p>')+
   (ready||completed?'<section class="c9-quiz"><h3>'+escape(l.check.q)+'</h3><div class="knowledge">'+l.check.options.map((op,i)=>'<button class="option '+(checked===i?(i===l.check.correct?"correct":"incorrect"):"")+'" data-action="answer-check" data-id="'+escape(l.id)+'" data-index="'+i+'">'+String.fromCharCode(65+i)+'. '+escape(op)+'</button>').join("")+'<div class="reveal" '+(checked===undefined?'hidden':'')+'><b>'+(checked===l.check.correct?"✓ Correct.":"Try again.")+'</b> '+escape(l.check.why)+'</div></div>'+(completed?'<p class="c9-completed">✓ Previously completed lesson preserved.</p>':'<button class="btn journey-primary" data-action="complete-lesson" data-id="'+escape(l.id)+'" '+(checked!==l.check.correct?'disabled':'')+'>Mark full lesson complete</button>')+'</section>':'<p class="c9-muted">Confidently recall each topic to unlock the original checkpoint. Previously completed lessons are never reset.</p>')+
   '<div class="c9-actions">'+(parts[position+1]?'<button class="btn journey-primary" data-go="lesson/'+escape(l.id)+'/'+parts[position+1].id+'">Next small topic →</button>':next?'<button class="btn journey-primary" data-go="lesson/'+escape(next)+'">Next lesson →</button>':'')+
   '<button class="c9-quiet" data-action="c9-stage" data-id="recall">Review again</button><button class="c9-quiet" data-go="practice/'+escape(l.id)+'">Interview questions ↗</button></div>';
 }
 return '<div class="c9-reader" data-lesson="'+escape(l.id)+'" data-topic="'+section.id+'" data-stage="'+escape(stage)+'">'+
  '<button class="c9-back" data-go="track/'+escape(l.trackId)+'">← '+escape(t)+'</button>'+
  '<header class="c9-header"><p class="c9-kicker">GUIDED STUDY / '+escape(t)+'</p><h1>'+escape(l.title)+'</h1><p>'+escape(l.goal)+'</p><div class="c9-meta"><span>'+mastered+' / '+parts.length+' topics recalled</span><span>'+escape(l.minutes||"")+' min original lesson</span>'+bookmark+'</div></header>'+
  '<nav class="c9-topics" aria-label="Topics in this lesson">'+nav+'</nav>'+
  '<nav class="c9-stages" aria-label="Learning steps">'+stages.map(([key,label],i)=>'<button data-action="c9-stage" data-id="'+key+'" '+(key===stage?'aria-current="step"':'')+'><span>'+String(i+1).padStart(2,"0")+'</span><b>'+label+'</b></button>').join("")+'</nav>'+
  '<section class="c9-panel" id="c9-panel" aria-label="Current learning step">'+body+'</section>'+
  '<footer class="c9-notes"><label for="lesson-notes">Private learning notes</label><textarea id="lesson-notes" class="c9-input" data-save-note="'+escape(l.id)+'" rows="3" placeholder="Save your own explanation…">'+escape(notes)+'</textarea></footer></div>';
}
window.LegacyReaderV9={topics,select,allReady,render:markup,stages};
})();
