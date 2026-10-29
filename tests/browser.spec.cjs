const {test,expect}=require('@playwright/test');
const fs=require('node:fs');const path=require('node:path');
const returning=require('./fixtures/returning-learner.json');
test('today uses the real next lesson and exactly three primary destinations',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.nav button[data-route]')).toHaveCount(3);
 await expect(page.locator('.journey-focus-main h1')).not.toBeEmpty();
 await expect(page.locator('.v6-stage')).toHaveCount(5);
 const metrics=await page.evaluate(()=>window.__courseDiagnostics);
 expect(metrics.lessonCount).toBeGreaterThanOrEqual(79);
 expect(metrics.questionCount).toBeGreaterThanOrEqual(183);
 expect(metrics.navigationSections).toBe(3);
});
test('AWS lessons and exact-topic practice are connected',async({page})=>{
 await page.goto('/#aws');
 await expect(page.getByRole('heading',{name:'AWS Solutions Architect.'})).toBeVisible();
 await page.locator('[data-go="lesson/aws-vpc"]').first().click();
 await expect(page.getByRole('heading',{name:'How does an AWS VPC keep an API private?'})).toBeVisible();
 await expect(page.locator('.c8-stage-nav button')).toHaveCount(5);
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="overview"]').click();
 await expect(page.locator('.c8-diagram-lane')).toHaveCount(2);
 await expect(page.locator('.c8-diagram-flow li')).toHaveCount(6);
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="finish"]').click();
 await page.locator('[data-go="practice/aws-vpc"]').click();
 await expect(page.locator('.practice-one-question')).toContainText('subnet');
 await expect(page.locator('[data-go="aws-lab/aws-network"]')).toBeVisible();
});
test('returning learners keep notes, progress, theme and path after switching',async({page})=>{
 await page.goto('/');
 await page.evaluate(data=>localStorage.setItem('fullstack-os-course-v2',JSON.stringify(data)),returning);
 await page.reload(); // Rehydrate the application's in-memory course state from the fixture.
 await page.goto('/#learn');
 await expect(page.locator('body')).not.toHaveClass(/light/);
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(before.notes['node-runtime']).toContain('timeout');
 await page.locator('[data-action="choose-path"][data-id="ai"]').click();
 await expect(page).toHaveURL(/#ai-path/);
 await page.reload();
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(after.activePath).toBe('ai');
 expect(after.done).toEqual(before.done);
 expect(after.notes).toEqual(before.notes);
 expect(after.labDrafts).toEqual(before.labDrafts);
 expect(after.theme).toBe('dark');
});
test('self-verified AWS lab persists without resetting legacy state',async({page})=>{
 await page.goto('/');
 await page.evaluate(data=>localStorage.setItem('fullstack-os-course-v2',JSON.stringify(data)),returning);
 await page.reload(); // Rehydrate the application's in-memory course state from the fixture.
 await page.goto('/#aws-lab/aws-network');
 await page.getByRole('button',{name:'I verified these criteria'}).click();
 await expect(page.getByRole('button',{name:/Self-verified/})).toBeVisible();
 await page.reload();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(saved.awsLabDone).toContain('aws-network');
 expect(saved.done).toContain('node-runtime');
 expect(saved.notes['node-runtime']).toBeTruthy();
});
test('old routes and user content remain navigable',async({page})=>{
 for(const [route,label] of [['#backend','Backend Engineering'],['#ai-path','AI Engineering'],['#lesson/node-runtime','Node'],['#projects','Build something real'],['#interviews','Explain it clearly'],['#diagrams','Trace the architecture'],['#flashcards','What do you remember'],['#labs','Build and test']]){
  await page.goto('/'+route);
  await expect(page.locator('#app')).toContainText(label,{timeout:10000});
  await expect(page.locator('#app')).not.toContainText('Page not found');
 }
});
for(const width of [375,768,1440]){
 test('responsive '+width+'px and light/dark reading',async({page})=>{
  await page.setViewportSize({width,height:850});
  await page.goto('/#learn');
  await expect(page.locator('.v6-stage')).toHaveCount(5);
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
  fs.mkdirSync(path.join(__dirname,'..','test-results'),{recursive:true});
  await page.screenshot({path:path.join(__dirname,'..','test-results','v6-learn-'+width+'.png'),fullPage:true});
  await page.goto('/#lesson/aws-iam');
  await expect(page.locator('.c9-reader[data-stage="try"]')).toBeVisible();
  await page.locator('#theme-btn').click();
  await expect(page.locator('body')).not.toHaveClass(/light/);
  await page.screenshot({path:path.join(__dirname,'..','test-results','v6-dark-lesson-'+width+'.png'),fullPage:true});
 });
}

test('all registered lessons and practice handoffs render, including legacy deep links',async({page})=>{
 await page.goto('/');
 const audit=await page.evaluate(()=>{
  const ids=window.COURSE_TRACKS.flatMap(t=>t.lessons.map(l=>l.id)),bad=[];
  for(const id of ids){
   for(const type of ['lesson','practice']){
    location.hash='#'+type+'/'+id;
    window.dispatchEvent(new Event('hashchange'));
    const html=document.querySelector('#app').innerHTML;
    if(!html||html.includes('Page not found'))bad.push(type+'/'+id);
   }
  }
  return {checked:ids.length*2,bad};
 });
 expect(audit.checked).toBeGreaterThanOrEqual(158);
 expect(audit.bad).toEqual([]);
});
test('theme switching survives refresh and navigation',async({page})=>{
 await page.goto('/#dashboard');
 await expect(page.locator('body')).toHaveClass(/light/);
 await page.locator('#theme-btn').click();
 await expect(page.locator('body')).not.toHaveClass(/light/);
 await page.reload();
 await expect(page.locator('body')).not.toHaveClass(/light/);
 await page.goto('/#aws');
 await expect(page.locator('body')).not.toHaveClass(/light/);
});


test('one question-first stage at a time, with three focused microtopics',async({page})=>{
 await page.goto('/#lesson/js-event-loop');
 await expect(page.locator('.c8-reader[data-stage="try"]')).toBeVisible();
 await expect(page.locator('.c8-topic-buttons button')).toHaveCount(3);
 await expect(page.locator('.c8-stage-nav button')).toHaveCount(5);
 await expect(page.locator('.c8-stage-panel h2')).toContainText('When an async function encounters await');
 await expect(page.locator('.c8-code')).toHaveCount(0);
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="overview"]').click();
 await expect(page.locator('.c8-reader[data-stage="overview"]')).toBeVisible();
 await expect(page.locator('.c8-diagram-lane')).toHaveCount(2);
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="process"]').click();
 await expect(page.locator('.c8-code')).toBeVisible();
 await expect(page.locator('.c8-diagram')).toHaveCount(0);
 await page.locator('.c8-topic-buttons [data-go="lesson/js-event-loop/queues"]').click();
 await expect(page).toHaveURL(/#lesson\/js-event-loop\/queues/);
 await expect(page.locator('.c8-reader[data-stage="try"]')).toBeVisible();
 await page.reload();
 await expect(page.locator('.c8-stage-panel h2')).toContainText('Why can a resolved Promise');
});
test('memory-first attempt, recall, rating and original learner notes persist',async({page})=>{
 await page.goto('/');
 await page.evaluate(data=>localStorage.setItem('fullstack-os-course-v2',JSON.stringify(data)),returning);
 await page.reload();
 await page.goto('/#lesson/js-event-loop/queues');
 await page.locator('[data-v8-first="js-event-loop/queues"]').fill('I predict the microtasks execute ahead of a timer.');
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="recall"]').click();
 await expect(page.locator('.c8-reader[data-stage="recall"]')).toBeVisible();
 await expect(page.locator('.c8-diagram')).toHaveCount(0);
 await expect(page.locator('.c8-code')).toHaveCount(0);
 await page.locator('[data-save-shadow="js-event-loop/queues"]').fill('Sync stack first, then queued microtasks, then the timer task.');
 await page.locator('[data-action="v8-compare"]').click();
 await expect(page.locator('.c8-checklist li')).toHaveCount(3);
 await page.locator('[data-action="v8-rate"][data-rating="partial"]').click();
 await expect(page.locator('.c8-reader[data-stage="finish"]')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(saved.shadowV7['js-event-loop/queues'].initialDraft).toContain('microtasks');
 expect(saved.shadowV7['js-event-loop/queues'].draft).toContain('Sync stack');
 expect(saved.shadowV7['js-event-loop/queues'].rating).toBe('partial');
 expect(saved.shadowV7['js-event-loop/queues'].dueAt).toBeGreaterThan(Date.now()+2*86400000);
 expect(saved.notes['node-runtime']).toBeTruthy();
 expect(saved.done).toEqual(returning.done);
 await page.reload();
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="finish"]').click();
 await expect(page.locator('.c8-stage-panel')).toContainText('Partly recalled');
});
test('due reviews start hidden in recall but permit leaving recall mode',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  const key='fullstack-os-course-v2',p=JSON.parse(localStorage.getItem(key)||'{}');
  p.shadowV7={'aws-vpc/ingress':{draft:'SG allows ALB only',rating:'again',lastReviewed:Date.now()-2*86400000,dueAt:Date.now()-60000,attempts:1}};
  localStorage.setItem(key,JSON.stringify(p));
 });
 await page.reload();
 await expect(page.locator('.c7-due-list')).toContainText('Trace HTTPS through an ALB');
 await page.locator('.c7-due-list button').click();
 await expect(page).toHaveURL(/#lesson\/aws-vpc\/ingress\/recall/);
 await expect(page.locator('.c8-reader[data-stage="recall"]')).toBeVisible();
 await expect(page.locator('.c8-diagram')).toHaveCount(0);
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="overview"]').click();
 await expect(page.locator('.c8-reader[data-stage="overview"]')).toBeVisible();
 await expect(page.locator('.c8-diagram')).toBeVisible();
});
test('microtopic self-ratings gate overall lesson completion',async({page})=>{
 await page.goto('/#lesson/js-event-loop/stack');
 const question=await page.evaluate(()=>window.COURSE_TRACKS.flatMap(t=>t.lessons).find(l=>l.id==='js-event-loop').check.correct);
 await page.evaluate(idx=>{
  const k='fullstack-os-course-v2',s=JSON.parse(localStorage.getItem(k)||'{}');
  s.checks={...(s.checks||{}),'js-event-loop':idx};localStorage.setItem(k,JSON.stringify(s));
 },question);
 await page.reload();
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="finish"]').click();
 await expect(page.locator('[data-action="complete-lesson"]')).toHaveCount(0);
 // Even a synthesized legacy completion button cannot bypass the mastery guard.
 await page.evaluate(()=>{
  const x=document.createElement('button');x.dataset.action='complete-lesson';x.dataset.id='js-event-loop';
  document.getElementById('app').appendChild(x);x.click();x.remove();
 });
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')).done||[])).not.toContain('js-event-loop');
 await page.evaluate(()=>{
  const k='fullstack-os-course-v2',s=JSON.parse(localStorage.getItem(k)||'{}');
  s.shadowV7=Object.assign({},s.shadowV7,...['stack','queues','starvation'].map(m=>({['js-event-loop/'+m]:{rating:'ready',dueAt:Date.now()+7*86400000}})));
  localStorage.setItem(k,JSON.stringify(s));
 });
 await page.reload();
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="finish"]').click();
 await expect(page.locator('.c8-quiz')).toBeVisible();
 await page.locator('[data-action="complete-lesson"]').click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')).done)).toContain('js-event-loop');
});
test('interview bank teaches concepts without losing original question routes',async({page})=>{
 await page.goto('/#interviews');
 const card=page.locator('.question[data-qid="javascript-2"]');
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:/Learn visually/}).click();
 await expect(page).toHaveURL(/#lesson\/js-event-loop/);
 await expect(page.locator('.c8-reader[data-stage="try"]')).toBeVisible();
});
test('RAG keeps ingestion and query pipelines separate',async({page})=>{
 await page.goto('/#lesson/rag-architecture');
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="overview"]').click();
 await expect(page.locator('.c8-diagram-lane')).toHaveCount(2);
 await expect(page.locator('.c8-diagram-lane').first()).toContainText('INDEXING');
 await expect(page.locator('.c8-diagram-lane').last()).toContainText('QUERY');
 await expect(page.locator('.c8-diagram-lane').last()).toContainText('Authenticated question');
});
test('all four pilots render mobile diagrams, with readable code in light and dark mode',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 for(const id of ['js-event-loop','async-idempotency','aws-vpc','rag-architecture']){
  await page.goto('/#lesson/'+id);
  await expect(page.locator('.c8-reader')).toBeVisible();
  await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="overview"]').click();
  await expect(page.locator('.c8-diagram-lane')).toHaveCount(2);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
 }
 await page.goto('/#lesson/js-event-loop');
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="process"]').click();
 const light=await page.locator('.c8-code').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el.querySelector('code')).color}));
 expect(light.bg).toBe('rgb(21, 41, 35)');
 expect(light.fg).toBe('rgb(240, 251, 246)');
 await page.locator('#theme-btn').click();
 const dark=await page.locator('.c8-code').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el.querySelector('code')).color}));
 expect(dark).toEqual(light);
 fs.mkdirSync(path.join(__dirname,'..','test-results'),{recursive:true});
 await page.screenshot({path:'test-results/v8-mobile-process.png',fullPage:true});
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="overview"]').click();
 await page.screenshot({path:'test-results/v8-mobile-diagram.png',fullPage:true});
});

test('default lesson route can record recall of its first microtopic',async({page})=>{
 await page.goto('/#lesson/js-event-loop');
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="recall"]').click();
 await page.locator('[data-save-shadow="js-event-loop/stack"]').fill('The synchronous function runs until its first await, then resumes via a microtask.');
 await page.locator('[data-action="v8-compare"]').click();
 await page.locator('[data-action="v8-rate"][data-rating="ready"]').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(saved.shadowV7['js-event-loop/stack'].rating).toBe('ready');
 await expect(page.locator('.c8-reader[data-stage="finish"]')).toBeVisible();
});

test('capture desktop question, diagram and process for visual acceptance',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/#lesson/js-event-loop');
 fs.mkdirSync(path.join(__dirname,'..','test-results'),{recursive:true});
 await page.screenshot({path:'test-results/v8-desktop-question.png',fullPage:true});
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="process"]').click();
 await page.screenshot({path:'test-results/v8-desktop-process.png',fullPage:true});
 await page.goto('/#lesson/rag-architecture');
 await page.locator('.c8-stage-nav [data-action="v8-stage"][data-id="overview"]').click();
 await page.screenshot({path:'test-results/v8-desktop-rag-diagram.png',fullPage:true});
});

test('all non-pilot lessons have question-first guided chapters',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const pilots=window.CONCEPT_PILOTS_V7;
  const lessons=window.COURSE_TRACKS.flatMap(t=>t.lessons).filter(l=>!pilots[l.id]);
  const issues=[];
  for(const l of lessons){
   const chapters=window.LegacyReaderV9.topics(l);
   if(chapters.length<1)issues.push(l.id+' has no chapters');
   if(chapters.some(c=>!c.title||!c.body||!c.points.length))issues.push(l.id+' has empty chapter');
   location.hash='#lesson/'+l.id;
   window.dispatchEvent(new Event('hashchange'));
   const reader=document.querySelector('.c9-reader');
   if(!reader||reader.dataset.stage!=='try')issues.push(l.id+' not in guided try stage');
   if(reader&&reader.querySelectorAll('.c9-topics button').length!==chapters.length)issues.push(l.id+' chapter count mismatch');
  }
  return {count:lessons.length,issues};
 });
 expect(result.count).toBeGreaterThanOrEqual(75);
 expect(result.issues).toEqual([]);
});
test('a legacy lesson teaches one chapter at a time and retains original depth',async({page})=>{
 await page.goto('/#lesson/node-runtime');
 await expect(page.locator('.c9-reader[data-stage="try"]')).toBeVisible();
 await expect(page.locator('.c9-stages button')).toHaveCount(5);
 await expect(page.locator('.c9-topics button')).toHaveCount(4);
 await expect(page.locator('.c9-code')).toHaveCount(0);
 await page.locator('.c9-stages [data-id="understand"]').click();
 await expect(page.locator('.c9-mentalmap')).toBeVisible();
 await expect(page.locator('.c9-points li').first()).toContainText('Node');
 await page.locator('.c9-stages [data-id="implement"]').click();
 await expect(page.locator('.c9-code code')).toBeVisible();
 await expect(page.locator('.c9-details')).toHaveCount(2);
 await expect(page.locator('.c9-details').last()).not.toHaveAttribute('open');
 await page.locator('.c9-stages [data-id="recall"]').click();
 await expect(page.locator('.c9-code')).toHaveCount(0);
 await expect(page.locator('.c9-input[data-c9-recall]')).toBeVisible();
});
test('legacy chapter recall and progress survives reload and enforces completion gate',async({page})=>{
 await page.goto('/#lesson/node-runtime/topic-1');
 await page.locator('[data-c9-first]').fill('CPU-heavy tasks block the event loop.');
 await page.locator('.c9-stages [data-id="recall"]').click();
 await page.locator('[data-c9-recall]').fill('Node coordinates async I/O but CPU computations block the loop.');
 await page.locator('[data-action="c9-compare"]').click();
 await page.locator('[data-action="c9-rate"][data-rating="ready"]').click();
 await expect(page.locator('.c9-reader[data-stage="finish"]')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(saved.legacyRecallV9['node-runtime/topic-1'].rating).toBe('ready');
 expect(saved.legacyRecallV9['node-runtime/topic-1'].draft).toContain('I/O');
 await page.reload();
 await page.locator('.c9-stages [data-id="finish"]').click();
 await expect(page.locator('.c9-quiz')).toHaveCount(0);
 const wrong=await page.evaluate(()=>{
  const l=window.COURSE_TRACKS.flatMap(t=>t.lessons).find(l=>l.id==='node-runtime');
  const s=JSON.parse(localStorage.getItem('fullstack-os-course-v2'));s.checks={...(s.checks||{}),'node-runtime':l.check.correct};localStorage.setItem('fullstack-os-course-v2',JSON.stringify(s));
  return l.check.correct;
 });
 await page.reload();
 await page.locator('.c9-stages [data-id="finish"]').click();
 await expect(page.locator('[data-action="complete-lesson"]')).toHaveCount(0);
 // Pre-existing completions are not undone by new recall requirements.
 await page.evaluate(()=>{
  const k='fullstack-os-course-v2',s=JSON.parse(localStorage.getItem(k));
  s.done=[...(s.done||[]),'node-runtime'];localStorage.setItem(k,JSON.stringify(s));
 });
 await page.reload();
 await page.locator('.c9-stages [data-id="finish"]').click();
 await expect(page.locator('.c9-quiz')).toBeVisible();
 await expect(page.locator('.c9-completed')).toContainText('Previously completed');
});
test('legacy due reviews enter closed-book directly and can return to explanation',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  const k='fullstack-os-course-v2',s=JSON.parse(localStorage.getItem(k)||'{}');
  s.legacyRecallV9={'node-runtime/topic-1':{rating:'partial',dueAt:Date.now()-3600000,draft:'My previous answer'}};
  localStorage.setItem(k,JSON.stringify(s));
 });
 await page.reload();
 await expect(page.locator('.c7-due-list')).toContainText('One event loop');
 await page.locator('.c7-due-list button').first().click();
 await expect(page).toHaveURL(/#lesson\/node-runtime\/topic-1\/recall/);
 await expect(page.locator('.c9-reader[data-stage="recall"]')).toBeVisible();
 await expect(page.locator('.c9-code')).toHaveCount(0);
 await page.locator('.c9-stages [data-id="understand"]').click();
 await expect(page.locator('.c9-mentalmap')).toBeVisible();
});
test('legacy guided lesson mobile layout uses legible code in dark and light',async({page})=>{
 await page.setViewportSize({width:375,height:810});
 await page.goto('/#lesson/aws-iam');
 await expect(page.locator('.c9-reader')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
 await page.locator('.c9-stages [data-id="implement"]').click();
 const colors=await page.locator('.c9-code').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el.querySelector('code')).color}));
 expect(colors).toEqual({bg:'rgb(21, 41, 35)',fg:'rgb(240, 251, 246)'});
 await page.locator('#theme-btn').click();
 expect(await page.locator('.c9-code').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el.querySelector('code')).color}))).toEqual(colors);
 fs.mkdirSync(path.join(__dirname,'..','test-results'),{recursive:true});
 await page.screenshot({path:'test-results/v9-legacy-mobile-process.png',fullPage:true});
 await page.locator('.c9-stages [data-id="understand"]').click();
 await page.screenshot({path:'test-results/v9-legacy-mobile-map.png',fullPage:true});
});

test('AWS source code prints real newlines, not visible backslash-n escapes',async({page})=>{
 await page.goto('/#lesson/aws-iam');
 await page.locator('.c9-stages [data-id="implement"]').click();
 const source=await page.locator('.c9-code code').textContent();
 expect(source).toContain('Effect');
 expect(source.split('\n').length).toBeGreaterThanOrEqual(3);
 expect(source.startsWith('{')).toBeTruthy();
});
test('mobile topic navigation is compact and remains horizontally accessible',async({page})=>{
 await page.setViewportSize({width:375,height:810});
 await page.goto('/#lesson/aws-iam');
 const measurements=await page.locator('.c9-topics').evaluate(el=>({
  viewportHeight:el.getBoundingClientRect().height,
  scrollWidth:el.scrollWidth,
  clientWidth:el.clientWidth
 }));
 expect(measurements.viewportHeight).toBeLessThan(100);
 expect(measurements.scrollWidth).toBeGreaterThan(measurements.clientWidth);
 await page.locator('.c9-stages [data-id="understand"]').click();
 await expect(page.locator('.c9-mentalmap')).toContainText('First-principles mechanism');
 const details=await page.locator('.c9-details').count();
 expect(details).toBe(0);
 fs.mkdirSync(path.join(__dirname,'..','test-results'),{recursive:true});
 await page.screenshot({path:'test-results/v9-mobile-polished-map.png',fullPage:true});
});
