import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createIndex} from "../src/retrieval.js";
import {createPolicyTools,runBoundedAgent} from "../src/agent.js";
const docs=JSON.parse(await readFile(new URL("../data/policies.json",import.meta.url)));
const tools=createPolicyTools(createIndex(docs));
const actor={userId:"user-a",tenantId:"clinic-a",scopes:["policy:read"]};
test("permitted read-only tool runs once",async()=>{
 const out=await runBoundedAgent({actor,tools,model:async({step})=>step===0
 ?{kind:"tool_call",name:"readPolicy",args:{documentId:"SOP-CAL-042",tenantId:"clinic-a"}}
 :{kind:"final",text:"Read successfully"}});
 assert.equal(out.status,"completed");
 assert.equal(out.trace[0].result.sourceId,"clinic-a:SOP-CAL-042:2");
});
test("unknown privileged tool is denied",async()=>{
 const out=await runBoundedAgent({actor,tools,model:async()=>({
  kind:"tool_call",name:"exportAllPatientRecords",args:{}
 })});
 assert.equal(out.status,"tool_denied");
 assert.equal(out.trace.length,1);
});
test("wrong tenant is forbidden",async()=>{
 const out=await runBoundedAgent({actor,tools,model:async()=>({
  kind:"tool_call",name:"readPolicy",args:{documentId:"SOP-CAL-042",tenantId:"clinic-b"}
 })});
 assert.equal(out.status,"forbidden");
});
test("tool loop terminates after a bounded number of calls",async()=>{
 const out=await runBoundedAgent({actor,tools,maxSteps:3,model:async()=>({
  kind:"tool_call",name:"readPolicy",args:{documentId:"SOP-CAL-042",tenantId:"clinic-a"}
 })});
 assert.equal(out.status,"step_limit");
 assert.equal(out.trace.length,3);
});
test("missing scope is forbidden",async()=>{
 const out=await runBoundedAgent({actor:{...actor,scopes:[]},tools,model:async()=>({
  kind:"tool_call",name:"readPolicy",args:{documentId:"SOP-CAL-042",tenantId:"clinic-a"}
 })});
 assert.equal(out.status,"forbidden");
});
