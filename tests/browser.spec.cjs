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
 await expect(page.locator('.lesson-phase-nav button')).toHaveCount(4);
 await expect(page.locator('.aws-flow-node')).toHaveCount(4);
 await page.locator('.lesson-phase-nav [data-go="practice/aws-vpc"]').click();
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
  await expect(page.locator('.lesson-content')).toBeVisible();
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

test('question-first pilot provides 12 microtopics and short step-by-step explanations',async({page})=>{
 await page.goto('/#lesson/js-event-loop');
 await expect(page.locator('.c7-reader')).toBeVisible();
 await expect(page.locator('.c7-micro-links button')).toHaveCount(3);
 await expect(page.locator('.c7-flow li')).toHaveCount(4);
 await expect(page.locator('.c7-bullets').first().locator('li')).toHaveCount(4);
 await expect(page.locator('.c7-reference')).not.toHaveAttribute('open');
 await page.locator('[data-go="lesson/js-event-loop/queues"]').click();
 await expect(page).toHaveURL(/#lesson\/js-event-loop\/queues/);
 await expect(page.locator('.c7-micro-content')).toContainText('Microtasks versus timer tasks');
 await expect(page.locator('.c7-micro-content .c7-code')).toBeVisible();
 await page.reload();
 await expect(page.locator('.c7-micro-content')).toContainText('Microtasks versus timer tasks');
});
test('closed-book recall really hides the explanation, saves draft and schedules review',async({page})=>{
 await page.goto('/');
 await page.evaluate(data=>localStorage.setItem('fullstack-os-course-v2',JSON.stringify(data)),returning);
 await page.goto('/#lesson/js-event-loop/queues');
 await page.reload();
 await page.locator('[data-action="shadow-start"]').click();
 await expect(page.locator('.c7-overview')).toHaveCount(0);
 await expect(page.locator('.c7-flow')).toHaveCount(0);
 await page.locator('[data-save-shadow="js-event-loop/queues"]').fill('Synchronous stack empties, then microtasks run before timer tasks.');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(stored.shadowV7['js-event-loop/queues'].draft).toContain('microtasks');
 expect(stored.notes['node-runtime']).toBeTruthy();
 await page.locator('[data-action="shadow-toggle-answer"]').click();
 await expect(page.locator('.c7-answer-key')).toBeVisible();
 await page.locator('[data-action="shadow-rate"][data-rating="partial"]').click();
 const rated=await page.evaluate(()=>JSON.parse(localStorage.getItem('fullstack-os-course-v2')));
 expect(rated.shadowV7['js-event-loop/queues'].rating).toBe('partial');
 expect(rated.shadowV7['js-event-loop/queues'].dueAt).toBeGreaterThan(Date.now()+2*86400000);
 expect(rated.done).toEqual(returning.done);
 await page.reload();
 await expect(page.locator('.c7-review-status')).toContainText('partial');
});
test('due reviews appear in Today and link to their exact microtopic',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  const key='fullstack-os-course-v2',p=JSON.parse(localStorage.getItem(key)||'{}');
  p.shadowV7={'aws-vpc/ingress':{draft:'SG allows ALB only',rating:'again',lastReviewed:Date.now()-2*86400000,dueAt:Date.now()-60000,attempts:1}};
  localStorage.setItem(key,JSON.stringify(p));
 });
 await page.reload();
 await expect(page.locator('.c7-due-list')).toContainText('Trace HTTPS through an ALB');
 await page.locator('.c7-due-list button').click();
 await expect(page).toHaveURL(/#lesson\/aws-vpc\/ingress/);
});
test('interview questions link to their concise concept explanations',async({page})=>{
 await page.goto('/#interviews');
 const card=page.locator('.question[data-qid="javascript-2"]');
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:/Learn visually/}).click();
 await expect(page).toHaveURL(/#lesson\/js-event-loop/);
 await expect(page.locator('.c7-reader')).toBeVisible();
});
test('all four pilots work on narrow mobile without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 for(const id of ['js-event-loop','async-idempotency','aws-vpc','rag-architecture']){
  await page.goto('/#lesson/'+id);
  await expect(page.locator('.c7-reader')).toBeVisible();
  await expect(page.locator('.c7-flow li')).toHaveCount(4);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
 }
 await page.screenshot({path:'test-results/v7-mobile-pilot.png',fullPage:true});
});
