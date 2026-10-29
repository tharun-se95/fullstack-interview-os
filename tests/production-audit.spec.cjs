'use strict';
/**
 * Independent PRODUCTION audit. This spec never serves local app files.
 * Browser fetches the configured public origin; per-lesson diagnostics are written to JSON/CSV.
 * No production user accounts or real backend resources are modified: only isolated browser localStorage.
 */
const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const origin=(process.env.PRODUCTION_ORIGIN||'https://fullstack-interview-os.vercel.app').replace(/\/$/,'');
const dir=path.resolve(__dirname,'../production-audit');
fs.mkdirSync(dir,{recursive:true});
const save=(name,data)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(data,null,2)+'\n');
const css=(v)=>String(v).replaceAll('"','&quot;');
test.setTimeout(240000);

async function loadProduction(page){
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e.message||e)));
 const response=await page.goto(origin+'/#dashboard',{waitUntil:'domcontentloaded',timeout:35000});
 await page.waitForTimeout(400);
 return {response,errors};
}
async function route(page,hash){
 await page.evaluate(hash=>{
  location.hash='#'+hash;
  window.dispatchEvent(new Event('hashchange'));
 },hash);
}
function inventory(page){
 return page.evaluate(()=>{
  const tracks=window.COURSE_TRACKS||[],questions=window.INTERVIEW_BANK||[];
  const lessons=tracks.flatMap(t=>t.lessons.map(l=>({id:l.id,title:l.title,trackId:t.id,trackTitle:t.title,goal:l.goal,minutes:l.minutes,checkCorrect:l.check?.correct,options:l.check?.options?.length,hasTheory:!!l.theory,hasCode:!!l.code,hasTask:!!l.task,hasSolution:!!l.solution,hasWalkthrough:!!l.walkthrough,hasPitfall:!!l.pitfall})));
  return {origin:location.origin,title:document.title,diagnostics:window.__courseDiagnostics||null,tracks:tracks.map(t=>({id:t.id,title:t.title,lessons:t.lessons.length})),lessonCount:lessons.length,questionCount:questions.length,lessonIds:lessons.map(l=>l.id),lessons,questionIds:questions.map(q=>q.id),pilots:Object.keys(window.CONCEPT_PILOTS_V7||{}),scripts:[...document.querySelectorAll('script[src]')].map(x=>x.getAttribute('src')),styles:[...document.querySelectorAll('link[rel=stylesheet]')].map(x=>x.getAttribute('href'))};
 });
}
test('production shell, deployed assets and complete live lesson inventory',async({page,request})=>{
 const {response,errors}=await loadProduction(page);
 const http=response?.status()||0;
 const data=await inventory(page);
 const assets=[...data.scripts,...data.styles],status=[];
 for(const file of assets){
  try{
   const r=await request.get(origin+'/'+file,{timeout:15000});
   status.push({file,status:r.status(),size:(await r.body()).length});
  }catch(e){status.push({file,status:0,error:String(e).slice(0,180)})}
 }
 const report={origin,checkedAt:new Date().toISOString(),http,documentOrigin:data.origin,tracks:data.tracks,lessonCount:data.lessonCount,questionCount:data.questionCount,diagnostics:data.diagnostics,scriptCount:data.scripts.length,styleCount:data.styles.length,assets:status,errors};
 save('00-production-inventory.json',report);
 expect(http,'Production HTML HTTP response').toBe(200);
 expect(data.origin,'Browser must be on PRODUCTION hostname').toBe(new URL(origin).origin);
 expect(data.diagnostics?.version,'Required Iteration 8 renderer').toBe('8.0.0-guided');
 expect(data.lessonCount,'All lessons must be loaded from production scripts').toBeGreaterThanOrEqual(79);
 expect(data.tracks.length,'All tracks').toBeGreaterThanOrEqual(19);
 expect(data.questionCount,'All interview questions').toBeGreaterThanOrEqual(183);
 expect(status.filter(s=>s.status!==200),'Missing or protected production assets').toEqual([]);
 expect(errors,'Unhandled page errors on production bootstrap').toEqual([]);
});
for(const width of [375,768,1440]){
 test('every production lesson renders at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:900});
  const {response,errors}=await loadProduction(page);
  if(response?.status()!==200)throw new Error('Production origin HTTP '+response?.status());
  const data=await inventory(page),rows=[];
  for(const l of data.lessons){
   const row={track:l.trackId,id:l.id,title:l.title,viewport:width,pass:true,issues:[],warnings:[]};
   try{
    await route(page,'lesson/'+l.id);
    const result=await page.evaluate(({l})=>{
     const app=document.querySelector('#app'),pilot=!!window.CONCEPT_PILOTS_V7?.[l.id];
     const h1=app?.querySelector('h1')?.textContent?.trim()||'';
     const body=app?.innerText||'';
     const detail=window.CONCEPT_PILOTS_V7?.[l.id];
     return {hash:location.hash,heading:h1,bodyChars:body.length,notFound:body.includes('Page not found'),pilot,renderer:!!app?.querySelector(pilot?'.c8-reader':'.lesson-layout'),stage:app?.querySelector('.c8-reader')?.dataset.stage||null,questionFirst:!!app?.querySelector('.c8-stage-panel h2'),mcqCount:app?.querySelectorAll('.knowledge .option').length||0,microCount:detail?.microtopics?.length||0,expectedTitle:pilot?detail.title:l.title,scrollOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    },{l});
    row.heading=result.heading;row.bodyChars=result.bodyChars;row.pilot=result.pilot;row.renderer=result.renderer;row.mcqCount=result.mcqCount;row.microCount=result.microCount;row.overflow=result.scrollOverflow;
    if(result.hash!=='#lesson/'+l.id)row.issues.push('Incorrect lesson URL');
    if(result.notFound)row.issues.push('Page not found');
    if(result.heading!==result.expectedTitle)row.issues.push('Lesson heading mismatch: '+result.heading);
    if(result.bodyChars<150)row.issues.push('Insufficient rendered lesson content');
    if(!result.renderer)row.issues.push('Lesson renderer missing');
    if(result.pilot){
      if(result.stage!=='try'||!result.questionFirst||result.microCount!==3)row.issues.push('Question-first pilot initial stage broken');
    }else if(result.mcqCount<2)row.issues.push('Missing original knowledge checkpoint');
    if(result.scrollOverflow>2)row.issues.push('Horizontal document overflow +'+result.scrollOverflow+'px');
    for(const k of ['hasTheory','hasCode','hasTask','hasSolution','hasWalkthrough','hasPitfall']){
     if(!l[k])row.warnings.push('Course source missing '+k);
    }
    if(!Number.isInteger(l.checkCorrect)||l.options<2)row.issues.push('Invalid checkpoint metadata');
   }catch(e){row.issues.push('Runtime exception: '+String(e.message||e).slice(0,300))}
   row.pass=row.issues.length===0;
   rows.push(row);
   if(!row.pass&&rows.filter(x=>!x.pass).length<=4){
    await page.screenshot({path:path.join(dir,'FAIL-'+width+'-'+l.id+'.png'),fullPage:true}).catch(()=>{});
   }
  }
  const report={origin,viewport:width,checkedAt:new Date().toISOString(),total:rows.length,passed:rows.filter(x=>x.pass).length,failed:rows.filter(x=>!x.pass).length,failures:rows.filter(x=>!x.pass),warnings:rows.filter(x=>x.warnings.length),pageErrors:errors,rows};
  save('01-lessons-'+width+'.json',report);
  const cols=['track','id','title','viewport','pass','heading','bodyChars','pilot','mcqCount','microCount','overflow','issues','warnings'];
  const q=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  fs.writeFileSync(path.join(dir,'01-lessons-'+width+'.csv'),[cols.map(q).join(','),...rows.map(row=>cols.map(k=>q(Array.isArray(row[k])?row[k].join(' | '):row[k])).join(','))].join('\n')+'\n');
  expect(rows.length).toBeGreaterThanOrEqual(79);
  expect(rows.filter(x=>!x.pass).map(x=>({id:x.id,issues:x.issues})),width+'px failures').toEqual([]);
  expect(errors,'Production page exceptions').toEqual([]);
 });
}
test('every production lesson routes into its actual interview practice',async({page})=>{
 await loadProduction(page);
 const data=await inventory(page),rows=[];
 for(const l of data.lessons){
  const row={track:l.trackId,id:l.id,issues:[]};
  try{
   await route(page,'practice/'+l.id);
   const result=await page.evaluate(()=>{
    const app=document.querySelector('#app'),q=app?.querySelector('.practice-one-question h2');
    return {hash:location.hash,question:q?.textContent?.trim()||'',notFound:app?.innerText.includes('Page not found'),returnLink:!!app?.querySelector('[data-go^="lesson/"]'),options:app?.querySelectorAll('[data-action="practice-grade"]').length||0};
   });
   row.question=result.question;
   if(result.hash!=='#practice/'+l.id)row.issues.push('Practice route mismatch');
   if(!result.question||result.question.length<12)row.issues.push('No visible interview question');
   if(result.notFound)row.issues.push('Not found');
   if(!result.returnLink)row.issues.push('No link back to lesson');
   if(result.options<2)row.issues.push('Missing recall grade actions');
  }catch(e){row.issues.push(String(e.message||e).slice(0,300))}
  rows.push(row);
 }
 save('02-practice-handoffs.json',{origin,checkedAt:new Date().toISOString(),total:rows.length,passed:rows.filter(r=>!r.issues.length).length,failures:rows.filter(r=>r.issues.length),rows});
 expect(rows.length).toBeGreaterThanOrEqual(79);
 expect(rows.filter(x=>x.issues.length)).toEqual([]);
});
test('all twelve deployed microtopics open all five stages and show accurate flows',async({page})=>{
 await loadProduction(page);
 const topics=await page.evaluate(()=>Object.entries(window.CONCEPT_PILOTS_V7||{}).flatMap(([lessonId,x])=>x.microtopics.map(t=>({lessonId,microId:t.id,title:t.title}))));
 const rows=[];
 for(const t of topics){
  const row={...t,issues:[]};
  try{
   await route(page,'lesson/'+t.lessonId+'/'+t.microId);
   let result=await page.evaluate(()=>({stage:document.querySelector('.c8-reader')?.dataset.stage,prompt:document.querySelector('.c8-stage-panel h2')?.textContent,topic:document.querySelector('.c8-reader')?.dataset.micro}));
   if(result.stage!=='try'||result.topic!==t.microId||!result.prompt)row.issues.push('Question-first stage missing');
   for(const stage of ['overview','process','recall','finish']){
    await page.evaluate(stage=>document.querySelector('.c8-stage-nav [data-id="'+stage+'"]').click(),stage);
    result=await page.evaluate(()=>({stage:document.querySelector('.c8-reader')?.dataset.stage,diagrams:document.querySelectorAll('.c8-diagram-lane').length,code:!!document.querySelector('.c8-code code'),recall:!!document.querySelector('.c8-input[data-save-shadow]'),quiz:!!document.querySelector('.c8-summary')}));
    if(result.stage!==stage)row.issues.push('Stage does not transition to '+stage);
    if(stage==='overview'&&result.diagrams!==2)row.issues.push('Missing dual-lane flow');
    if(stage==='process'&&!result.code)row.issues.push('No readable code section');
    if(stage==='recall'&&(result.diagrams||result.code||!result.recall))row.issues.push('Recall not closed book');
    if(stage==='finish'&&!result.quiz)row.issues.push('No mastery status');
   }
  }catch(e){row.issues.push(String(e.message||e).slice(0,300))}
  rows.push(row);
 }
 save('03-guided-microtopics.json',{origin,checkedAt:new Date().toISOString(),total:rows.length,passed:rows.filter(r=>!r.issues.length).length,failures:rows.filter(r=>r.issues.length),rows});
 expect(topics.length,'Expected four pilot concepts × three microtopics').toBe(12);
 expect(rows.filter(x=>x.issues.length)).toEqual([]);
});
test('production browser persists a real recall attempt and due review without affecting real users',async({page})=>{
 await loadProduction(page);
 await route(page,'lesson/js-event-loop/queues');
 await page.locator('.c8-stage-nav [data-id="recall"]').click();
 await page.locator('[data-save-shadow="js-event-loop/queues"]').fill('The stack runs first. Then Promise microtasks drain before a timer task.');
 await page.locator('[data-action="v8-compare"]').click();
 await page.locator('[data-action="v8-rate"][data-rating="partial"]').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(saved.shadowV7['js-event-loop/queues'].rating).toBe('partial');
 expect(saved.shadowV7['js-event-loop/queues'].draft).toContain('microtasks');
 await page.reload();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')).shadowV7['js-event-loop/queues'].rating)).toBe('partial');
 save('04-production-recall.json',{origin,checkedAt:new Date().toISOString(),id:'js-event-loop/queues',rating:saved.shadowV7['js-event-loop/queues'].rating,attempts:saved.shadowV7['js-event-loop/queues'].attempts,persisted:true});
});
