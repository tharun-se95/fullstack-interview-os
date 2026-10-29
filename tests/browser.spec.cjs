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
 await expect(page.getByRole('heading',{name:'VPC routing, public/private subnets and security groups'})).toBeVisible();
 await expect(page.locator('.lesson-phase-nav button')).toHaveCount(4);
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
