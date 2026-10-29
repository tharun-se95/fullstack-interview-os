const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests',testMatch:'browser.spec.cjs',timeout:45000,fullyParallel:false,
 retries:1,reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]],
 use:{baseURL:'http://127.0.0.1:4173',...devices['Desktop Chrome'],trace:'retain-on-failure',screenshot:'only-on-failure'}
});
