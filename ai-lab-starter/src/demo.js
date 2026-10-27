import {readFile} from "node:fs/promises";
import {createIndex,retrieve,makeEvidencePacket} from "./retrieval.js";
import {evaluate} from "./eval.js";
import {createPolicyTools,runBoundedAgent} from "./agent.js";
const docs=JSON.parse(await readFile(new URL("../data/policies.json",import.meta.url)));
const cases=JSON.parse(await readFile(new URL("../data/gold-questions.json",import.meta.url)));
const index=createIndex(docs);
console.log("=== Offline retrieval demo ===");
for(const c of cases.slice(0,5)) {
 const hits=retrieve(index,c.question,c.tenantId);
 console.log("\nQuestion:",c.question);
 console.log("Sources:",makeEvidencePacket(hits).map(x=>x.id));
}
console.log("\n=== Gold recall report (lexical baseline only) ===");
const report=evaluate(index,cases,{k:5});
console.log(JSON.stringify({cases:report.cases,recallAt5:report.meanRecallAtK,
  abstentionRate:report.abstentionRate,privacyFailures:report.privacyFailures},null,2));
console.log("\n=== Agent tool boundary demo ===");
const tools=createPolicyTools(index);
const agent=await runBoundedAgent({
 actor:{userId:"demo",tenantId:"clinic-a",scopes:["policy:read"]},tools,
 model:async({step})=>step===0
  ?{kind:"tool_call",name:"readPolicy",args:{documentId:"SOP-CAL-042",tenantId:"clinic-a"}}
  :{kind:"final",text:"Source verified. A real model must validate claim support."}
});
console.log({status:agent.status,toolEvents:agent.trace.length});
