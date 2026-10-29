/* Small, framework-free reader for the four v7 pilots. Escape ALL content at render boundaries. */
(function(){
"use strict";
const e=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const bullets=items=>'<ul class="c7-bullets">'+items.map(v=>'<li>'+e(v)+'</li>').join("")+'</ul>';
const steps=items=>'<ol class="c7-steps">'+items.map(v=>'<li>'+e(v)+'</li>').join("")+'</ol>';
const code=(title,source)=>'<figure class="c7-code"><figcaption>'+e(title)+'</figcaption><pre><code>'+e(source)+'</code></pre></figure>';
const getKey=(id,microId)=>id+"/"+microId;
function render(args){
 const {lesson:l,topic,checkpoint,completed,review={},shadowMode=false,showAnswer=false,bookmark="",referenceHtml="",practiceLink="",nextLesson=""}=args;
 const parts=window.CONCEPT_PILOTS_V7[l.id];
 if(!parts)return "";
 const item=parts.microtopics.find(t=>t.id===topic)||parts.microtopics[0];
 const key=getKey(l.id,item.id),entry=review[key]||{};
 const index=parts.microtopics.findIndex(t=>t.id===item.id);
 const checklist=bullets(item.checklist);
 const answerOptions=l.check.options.map((option,i)=>'<button class="option '+(checkpoint===i?(i===l.check.correct?"correct":"incorrect"):"")+'" data-action="answer-check" data-id="'+e(l.id)+'" data-index="'+i+'">'+String.fromCharCode(65+i)+'. '+e(option)+'</button>').join("");
 const readableDue=Number.isFinite(entry.dueAt)&&entry.dueAt>0?new Date(entry.dueAt).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"";
 const nextTopic=parts.microtopics[index+1];
 return '<div class="c7-reader" data-concept="'+e(l.id)+'" data-micro="'+e(item.id)+'">'+
  '<button class="c7-back" data-go="track/'+e(l.trackId)+'">← '+e(l.trackTitle)+'</button>'+
  '<header class="c7-hero"><div class="journey-kicker">QUESTION-FIRST LEARNING / '+e(l.trackTitle)+'</div><h1>'+e(parts.title)+'</h1><p>'+e(parts.context)+'</p><div class="c7-meta"><span>3 small topics</span><span>'+e(l.minutes)+' min original reference</span><span>'+(completed?'✓ Lesson completed':'Checkpoint available')+'</span>'+bookmark+'</div></header>'+
  '<nav class="lesson-phase-nav c7-phase" aria-label="Lesson stages"><button type="button" data-action="jump-section" data-id="concept-high"><span>01</span><b>Understand</b></button><button type="button" data-action="jump-section" data-id="concept-process"><span>02</span><b>Process</b></button><button type="button" data-action="jump-section" data-id="concept-recall"><span>03</span><b>Recall</b></button><button type="button" data-go="practice/'+e(l.id)+'"><span>04</span><b>Defend</b></button></nav>'+
  '<div class="lesson-content c7-body">'+
  (shadowMode?'':('<section id="concept-high" class="c7-overview"><div class="journey-kicker">01 / BIG PICTURE</div><h2>Understand it in 90 seconds.</h2>'+bullets(parts.bigPicture)+'</section>'+
   '<section class="c7-flow-section" aria-label="System flow diagram"><div class="journey-kicker">02 / VISUAL FLOW</div><h2>Trace what happens.</h2><ol class="c7-flow">'+parts.flow.map((n,i)=>'<li><span class="c7-flow-index">'+String(i+1).padStart(2,"0")+'</span><b>'+e(n[0])+'</b><small>'+e(n[1])+'</small></li>').join("")+'</ol></section>'+
   '<section class="c7-micro-nav" aria-label="Small topics"><div class="journey-kicker">03 / SMALL TOPICS · ONE AT A TIME</div><h2>Learn the process.</h2><div class="c7-micro-links">'+parts.microtopics.map((t,i)=>'<button '+(t.id===item.id?'aria-current="step" ':'')+'data-go="lesson/'+e(l.id)+'/'+e(t.id)+'"><span>'+String(i+1).padStart(2,"0")+'</span><b>'+e(t.title)+'</b><small>'+e(t.minutes)+' min</small></button>').join("")+'</div></section>'+
   '<section class="c7-micro-content" id="concept-process"><div class="journey-kicker">FOCUS '+(index+1)+' OF '+parts.microtopics.length+' / '+e(item.minutes)+' MIN</div><h2>'+e(item.title)+'</h2>'+bullets(item.bullets)+'<h3>Follow the process</h3>'+steps(item.steps)+code(item.exampleTitle,item.code)+'<details class="c7-details"><summary>Go deeper: edge cases and trade-offs</summary>'+bullets(item.deepDive)+'</details></section>'))+
  '<section class="c7-recall'+(shadowMode?' is-recalling':'')+'" id="concept-recall" aria-label="Closed-book recall"><div class="journey-kicker">04 / SHADOW STUDY · RETRIEVAL PRACTICE</div><h2>'+(shadowMode?'Explain it from memory.':'Can you explain this without notes?')+'</h2><p class="c7-prompt">'+e(item.recallPrompt)+'</p>'+
  (!shadowMode?'<p class="c7-recall-info">Read the explanation once. Then hide it, explain the mechanism, and compare your answer with the checklist.</p><button class="btn journey-primary" data-action="shadow-start">Hide material & start recall →</button>':
  '<label class="c7-answer-label" for="c7-recall-answer">Your explanation</label><textarea id="c7-recall-answer" class="textarea c7-recall-textarea" data-save-shadow="'+e(key)+'" rows="5" placeholder="Explain the flow, key constraints and one failure case…">'+e(entry.draft||"")+'</textarea>'+
  '<div class="c7-recall-actions"><button class="btn secondary" data-action="shadow-toggle-answer">'+(showAnswer?'Hide checklist':'Compare with checklist')+'</button><button class="journey-subtle-link" data-action="shadow-return">Return to explanation</button></div>'+
  (showAnswer?'<div class="c7-answer-key" aria-label="Answer checklist"><h3>Check your reasoning</h3>'+checklist+'<p class="tiny muted">Self-assess your explanation. This course does not automatically grade free-form answers.</p><div class="c7-ratings" aria-label="Rate your recall"><button data-action="shadow-rate" data-rating="again" data-id="'+e(key)+'">Missed it · 1 day</button><button data-action="shadow-rate" data-rating="partial" data-id="'+e(key)+'">Partly recalled · 3 days</button><button data-action="shadow-rate" data-rating="ready" data-id="'+e(key)+'">Explained well · 7 days</button></div></div>':''))+
  (entry.rating?'<p class="c7-review-status" role="status">Last self-rating: '+e(entry.rating)+' · '+(readableDue?'Revisit on '+e(readableDue):'Scheduled for review')+'</p>':'')+'</section>'+
  (shadowMode?'':('<section class="c7-application" aria-label="Practice and checkpoint"><div class="journey-kicker">05 / CHECK & APPLY</div><h2>Confirm understanding.</h2><p>'+e(l.check.q)+'</p><div class="knowledge">'+answerOptions+'<div class="reveal" '+(checkpoint===undefined?'hidden':'')+'><b>'+(checkpoint===l.check.correct?'✓ Correct.':'Not quite. Review and try again.')+'</b> '+e(l.check.why)+'</div></div>'+
  (completed?'<div class="c7-complete"><b>✓ Lesson complete.</b><button class="btn journey-primary" data-go="practice/'+e(l.id)+'">Defend this in an interview →</button></div>':'<button class="btn journey-primary" data-action="complete-lesson" data-id="'+e(l.id)+'" '+(checkpoint!==l.check.correct?'disabled':'')+'>Mark lesson complete</button>')+
  '<div class="c7-related"><button data-go="practice/'+e(l.id)+'">Practice related interview question ↗</button>'+ (nextTopic?'<button data-go="lesson/'+e(l.id)+'/'+e(nextTopic.id)+'">Next small topic →</button>':(nextLesson?'<button data-go="lesson/'+e(nextLesson)+'">Next lesson →</button>':''))+'</div></section>'+
  '<details class="c7-reference" id="concept-reference"><summary>Full technical reference · original lesson content</summary><div class="c7-reference-inner">'+referenceHtml+'</div></details>'+
  '<section class="c7-notes"><h2>Your private notes</h2><p class="tiny muted">Notes are still saved locally under the original lesson ID.</p><textarea class="textarea" id="lesson-notes" data-save-note="'+e(l.id)+'" placeholder="Write the concept in your own words…">'+e(args.notes||"")+'</textarea></section>'))+
  '</div></div>';
}
window.ConceptReaderV7={render,getKey};
})();
