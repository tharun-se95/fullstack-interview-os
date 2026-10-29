const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests',testMatch:'production-audit.spec.cjs',
 timeout:240000,expect:{timeout:8000},fullyParallel:false,
 workers:1,retries:0,reporter:[['list'],['html',{open:'never',outputFolder:'production-audit/playwright-report'}]],
 use:{baseURL:process.env.PRODUCTION_ORIGIN||'https://fullstack-interview-os.vercel.app',...devices['Desktop Chrome'],trace:'retain-on-failure',screenshot:'only-on-failure'}
});
