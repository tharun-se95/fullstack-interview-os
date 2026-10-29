'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const js=[...html.matchAll(/<script defer src="([^"]+)"/g)].map(m=>m[1]);const sandbox={window:{},console};vm.createContext(sandbox);
for(const src of js.filter(s=>s!=='app.js'))vm.runInContext(fs.readFileSync(path.join(root,src),'utf8'),sandbox,{filename:src,timeout:2500});
const tracks=sandbox.window.COURSE_TRACKS||[],bank=sandbox.window.INTERVIEW_BANK||[],labs=sandbox.window.CODING_LABS||[],lessons=tracks.flatMap(t=>t.lessons),ids=new Set(lessons.map(l=>l.id));
test('old curriculum and interviews remain intact',()=>{assert.ok(tracks.length>=18);assert.ok(lessons.length>=69);assert.ok(bank.length>=173);assert.ok(labs.length>=12);assert.equal(ids.size,lessons.length);assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);});
test('every lesson has teaching content and a sound checkpoint',()=>{for(const l of lessons){assert.ok(l.title&&l.goal&&l.theory&&l.code&&l.task&&l.solution,l.id);assert.ok(l.check&&Array.isArray(l.check.options)&&l.check.options.length>=2,l.id);assert.ok(Number.isInteger(l.check.correct)&&l.check.correct>=0&&l.check.correct<l.check.options.length,l.id);}});
test('interview questions map to real tracks',()=>{const topics=new Set(tracks.map(t=>t.id));for(const q of bank){assert.ok(topics.has(q.topic),q.id);assert.ok(q.q&&q.answer&&q.followup,q.id);}});
test('all journey stages map to existing lesson tracks',()=>{const stages=sandbox.window.FULLSTACK_JOURNEY?.stages||[];assert.equal(stages.length,5);const topics=new Set(tracks.map(t=>t.id));const seen=new Set();for(const stage of stages){assert.ok(stage.title&&stage.trackIds.length);for(const t of stage.trackIds){assert.ok(topics.has(t),'missing track '+t);assert.ok(!seen.has(t),'duplicate track '+t);seen.add(t);}}});
test('AWS sprint and interview handoffs are complete',()=>{const aws=tracks.find(t=>t.id==='aws');assert.ok(aws&&aws.lessons.length>=10);const awsLabs=sandbox.window.AWS_WORKSHOP?.labs||[];const diagrams=sandbox.window.AWS_DIAGRAMS||{};assert.equal(Object.keys(diagrams).length,aws.lessons.length);for(const l of aws.lessons)assert.ok(diagrams[l.id]?.nodes?.length>=3,'missing flow '+l.id);assert.ok(awsLabs.length>=3);for(const l of aws.lessons){assert.ok(bank.find(q=>q.id.startsWith(l.id+'-q')&&q.topic==='aws'),'missing exact AWS question '+l.id);assert.ok(sandbox.window.COURSE_DEPTH?.[l.id]?.chapters?.length>=2,'missing depth '+l.id);}for(const lab of awsLabs){assert.ok(lab.steps.length>=3&&lab.acceptance.length>=2,lab.id);}});
test('historical progress fixture retains previous keys and lesson IDs',()=>{const data=require('./fixtures/returning-learner.json');for(const key of ['done','checks','rated','notes','labDrafts','mockAnswers','activePath','theme','lastStudiedLessonId','lastCompletedLessonId'])assert.ok(Object.hasOwn(data,key),key);for(const id of data.done)assert.ok(ids.has(id),id);assert.equal(data.theme,'dark');});

test('question-first pilot content maps to existing source lessons and question IDs',()=>{
 const pilots=sandbox.window.CONCEPT_PILOTS_V7||{};
 const expected=['js-event-loop','async-idempotency','aws-vpc','rag-architecture'];
 assert.equal(Object.keys(pilots).length,4);
 assert.deepEqual(Object.keys(pilots).sort(),expected.sort());
 const seen=new Set();
 for(const [id,p] of Object.entries(pilots)){
  assert.ok(ids.has(id),id);
  assert.equal(p.flow.length,4,id);
  assert.ok(p.bigPicture.length>=3&&p.bigPicture.length<=5,id);
  assert.equal(p.microtopics.length,3,id);
  assert.ok(p.questionIds.length>0,id);
  for(const q of p.questionIds)assert.ok(bank.find(x=>x.id===q&&x.topic===lessons.find(l=>l.id===id)?.trackId)||bank.some(x=>x.id===q),'Missing question '+q);
  for(const m of p.microtopics){
   assert.ok(m.id&&m.title&&m.minutes>=5&&m.minutes<=12,id);
   assert.ok(m.bullets.length>=2&&m.bullets.length<=4,id+'/'+m.id);
   assert.ok(m.steps.length>=3&&m.steps.length<=5,id+'/'+m.id);
   assert.ok(m.code&&m.recallPrompt&&m.checklist.length>=3,id+'/'+m.id);
   const key=id+'/'+m.id;assert.ok(!seen.has(key),key);seen.add(key);
  }
 }
 assert.equal(seen.size,12);
 assert.equal(typeof sandbox.window.ConceptReaderV7.render,'function');
});
