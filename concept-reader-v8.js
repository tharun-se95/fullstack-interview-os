/* Iteration 8 — one step at a time, with memory-first entry and accessible visuals. */
(function(){
"use strict";
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const list=(values,ordered=false)=>'<'+(ordered?'ol class="c8-steps"':'ul class="c8-bullets"')+'>'+values.map(v=>'<li>'+esc(v)+'</li>').join("")+'</'+(ordered?'ol':'ul')+'>';
const stages=[["try","Try"],["overview","Understand"],["process","Implement"],["recall","Recall"],["finish","Finish"]];
const ratingLabel={ready:"Recalled confidently",partial:"Partly recalled",again:"Needs practice"};
const key=(lesson,micro)=>lesson+"/"+micro;
function diagram(d){
 if(!d)return "";
 return '<figure class="c8-diagram" aria-label="'+esc(d.headline)+'"><figcaption class="c8-diagram-title">'+esc(d.headline)+'</figcaption>'+
 d.lanes.map((lane,i)=>'<div class="c8-diagram-lane" data-lane="'+i+'"><div class="c8-diagram-label">'+esc(lane.label)+'</div><ol class="c8-diagram-flow">'+lane.nodes.map((node,j)=>'<li><b>'+esc(node[0])+'</b><span>'+esc(node[1])+'</span></li>').join("")+'</ol></div>').join("")+
 '<p class="c8-diagram-note"><strong>Important:</strong> '+esc(d.note)+'</p></figure>';
}
function codeBlock(title,code){
 return '<figure class="c8-code" aria-label="Example code"><figcaption>'+esc(title)+'</figcaption><pre><code>'+esc(code)+'</code></pre></figure>';
}
function render(args){
 const {lesson:l,topic,stage="try",review={},checkpoint,completed=false,notes="",bookmark="",referenceHtml="",nextLesson="",interviewQuestion}=args;
 const concept=window.CONCEPT_PILOTS_V7[l.id],d=window.CONCEPT_DIAGRAMS_V8[l.id];
 if(!concept)return "";
 const micro=concept.microtopics.find(x=>x.id===topic)||concept.microtopics[0];
 const microIndex=concept.microtopics.findIndex(x=>x.id===micro.id);
 const selected=stages.some(x=>x[0]===stage)?stage:"try";
 const entry=review[key(l.id,micro.id)]||{},ready=entry.rating==="ready";
 const count=concept.microtopics.filter(x=>review[key(l.id,x.id)]?.rating==="ready").length;
 const allReady=count===concept.microtopics.length;
 const nextMicro=concept.microtopics[microIndex+1];
 const status=t=>review[key(l.id,t.id)]?.rating==="ready"?"✓":review[key(l.id,t.id)]?.rating?"↻":null;
 const due=Number.isFinite(entry.dueAt)&&entry.dueAt>0?new Date(entry.dueAt).toLocaleDateString(undefined,{month:"short",day:"numeric"}):null;
 const nav='<nav class="c8-stage-nav" aria-label="Learning steps">'+stages.map(([id,title],i)=>'<button type="button" data-action="v8-stage" data-id="'+id+'" '+(selected===id?'aria-current="step"':'')+'><span>'+String(i+1).padStart(2,"0")+'</span><b>'+title+'</b></button>').join("")+'</nav>';
 const head='<div class="c8-eyebrow">QUESTION-FIRST LEARNING · '+esc(l.trackTitle)+'</div><h1>'+esc(concept.title)+'</h1><p>'+esc(concept.context)+'</p>';
 const microNav='<nav class="c8-micro-nav" aria-label="Microtopics in this lesson"><span class="c8-nav-label">YOUR TOPICS · '+count+' / '+concept.microtopics.length+' RECALLED</span><div class="c8-topic-buttons">'+concept.microtopics.map((t,i)=>'<button type="button" data-go="lesson/'+esc(l.id)+'/'+esc(t.id)+'" '+(t.id===micro.id?'aria-current="step"':'')+'><span class="c8-topic-number">'+(status(t)||String(i+1).padStart(2,"0"))+'</span><span class="c8-topic-title">'+esc(t.title)+'</span></button>').join("")+'</div></nav>';
 let body="";
 if(selected==="try"){
  body='<div class="c8-kicker">01 / ATTEMPT BEFORE READING</div><h2>'+esc(micro.recallPrompt)+'</h2>'+
  '<p class="c8-intro">Take a guess without searching. Knowing what you cannot yet explain is the starting point.</p>'+
  '<label for="c8-first-attempt">Your first explanation <span>(optional)</span></label><textarea class="c8-input" id="c8-first-attempt" data-v8-first="'+esc(key(l.id,micro.id))+'" rows="4" placeholder="What do you think happens, and why?">'+esc(entry.initialDraft||"")+'</textarea>'+
  '<div class="c8-actions"><button class="btn journey-primary" data-action="v8-stage" data-id="overview">Understand the big picture →</button><button class="c8-quiet" data-action="v8-stage" data-id="recall">Already know it? Test yourself</button></div>'+
  (interviewQuestion?'<p class="c8-hint">Related interview question: '+esc(interviewQuestion.q)+'</p>':'');
 } else if(selected==="overview"){
  body='<div class="c8-kicker">02 / BIG PICTURE</div><h2>'+esc(micro.title)+'</h2>'+
  list(micro.bullets)+diagram(d)+
  '<div class="c8-actions"><button class="btn journey-primary" data-action="v8-stage" data-id="process">Follow the implementation →</button><button class="c8-quiet" data-action="v8-stage" data-id="try">← Back to question</button></div>';
 } else if(selected==="process"){
  body='<div class="c8-kicker">03 / HOW IT WORKS</div><h2>'+esc(micro.title)+'</h2>'+
  '<p class="c8-intro">Trace the sequence first. Then inspect the smallest example that demonstrates it.</p>'+
  list(micro.steps,true)+codeBlock(micro.exampleTitle,micro.code)+
  '<details class="c8-details"><summary>Explore edge cases and production trade-offs</summary>'+list(micro.deepDive)+'</details>'+
  '<details class="c8-details"><summary>Read the original full technical reference</summary><div class="c8-original">'+referenceHtml+'</div></details>'+
  '<div class="c8-actions"><button class="btn journey-primary" data-action="v8-stage" data-id="recall">Close the explanation & recall →</button><button class="c8-quiet" data-action="v8-stage" data-id="overview">← Big picture</button></div>';
 } else if(selected==="recall"){
  body='<div class="c8-kicker">04 / SHADOW STUDY · CLOSED BOOK</div><h2>Explain it without notes.</h2><p class="c8-question">'+esc(micro.recallPrompt)+'</p>'+
  '<p class="c8-intro">Your earlier explanations and diagrams are hidden. Write the process from memory before comparing.</p>'+
  '<label for="c8-recall-answer">Your explanation</label><textarea class="c8-input" id="c8-recall-answer" data-save-shadow="'+esc(key(l.id,micro.id))+'" rows="5" placeholder="Explain the mechanism, the sequence and one important edge case…">'+esc(entry.draft||"")+'</textarea>'+
  '<div class="c8-actions"><button class="btn journey-primary" data-action="v8-compare">Compare with answer checklist</button><button class="c8-quiet" data-action="v8-stage" data-id="process">Review explanation first</button></div>'+
  (args.showAnswer?'<div class="c8-checklist" aria-live="polite"><h3>Did you cover these points?</h3>'+list(micro.checklist)+'<p>This is a self-rating, not an automatic correctness assessment.</p><div class="c8-rating"><button data-action="v8-rate" data-rating="again">Missed it · tomorrow</button><button data-action="v8-rate" data-rating="partial">Partly recalled · 3 days</button><button data-action="v8-rate" data-rating="ready">Explained well · 7 days</button></div></div>':'');
 } else {
  body='<div class="c8-kicker">05 / SAVE PROGRESS</div><h2>'+(ready?'You explained this topic.':entry.rating?'Keep this topic in review.':'One final memory check.')+'</h2>'+
  '<p class="c8-intro">'+(entry.rating?'Last self-rating: <strong>'+esc(ratingLabel[entry.rating]||entry.rating)+'</strong>'+(due?'. Next review: <strong>'+esc(due)+'</strong>.':'.'):'Finish recall and compare the model answer to record your confidence.')+'</p>'+
  '<div class="c8-summary"><strong>'+count+' of '+concept.microtopics.length+' topics recalled confidently.</strong><p>Individual topic ratings determine progress. The original lesson checkpoint is retained separately.</p></div>'+
  (allReady||completed?'<section class="c8-quiz"><h3>Original lesson checkpoint</h3><p>'+esc(l.check.q)+'</p><div class="knowledge">'+l.check.options.map((op,i)=>'<button class="option '+(checkpoint===i?(i===l.check.correct?"correct":"incorrect"):"")+'" data-action="answer-check" data-id="'+esc(l.id)+'" data-index="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(op)+'</button>').join("")+'<div class="reveal" '+(checkpoint===undefined?'hidden':'')+'><b>'+(checkpoint===l.check.correct?'✓ Correct.':'Try again.')+'</b> '+esc(l.check.why)+'</div></div>'+(completed?'<p class="c8-done">✓ This legacy lesson is marked completed.</p>':'<button class="btn journey-primary" data-action="complete-lesson" data-id="'+esc(l.id)+'" '+(checkpoint!==l.check.correct?'disabled':'')+'>Complete the full lesson</button>')+'</section>':'<p class="c8-unfinished">To complete the whole lesson, confidently recall all three microtopics and pass the original checkpoint.</p>')+
  '<div class="c8-actions">'+(nextMicro?'<button class="btn journey-primary" data-go="lesson/'+esc(l.id)+'/'+esc(nextMicro.id)+'">Next small topic →</button>':(nextLesson?'<button class="btn journey-primary" data-go="lesson/'+esc(nextLesson)+'">Next lesson →</button>':''))+
  '<button class="c8-quiet" data-action="v8-stage" data-id="recall">Recall this topic again</button><button class="c8-quiet" data-go="practice/'+esc(l.id)+'">Practice interview questions ↗</button></div>';
 }
 return '<div class="c8-reader" data-concept="'+esc(l.id)+'" data-micro="'+esc(micro.id)+'" data-stage="'+selected+'">'+
 '<button class="c8-back" data-go="track/'+esc(l.trackId)+'">← '+esc(l.trackTitle)+'</button>'+
 '<header class="c8-header">'+head+'<div class="c8-meta"><span>'+esc(micro.minutes)+' min focused topic</span><span>'+count+' / '+concept.microtopics.length+' recalled</span>'+bookmark+'</div></header>'+
 microNav+nav+'<section class="c8-stage-panel" id="c8-stage-panel" aria-label="'+esc(stages.find(x=>x[0]===selected)[1])+' step">'+body+'</section>'+
 '<footer class="c8-footer"><div><strong>Private learning notes</strong><p>Saved on this device. Existing notes remain available.</p></div><textarea class="c8-notes" data-save-note="'+esc(l.id)+'" aria-label="Private learning notes" rows="3" placeholder="Your notes…">'+esc(notes)+'</textarea></footer></div>';
}
window.ConceptReaderV8={render,stages,key};
})();
