import {retrieve} from "./retrieval.js";
export function recallAtK(hits,gold,k=5) {
  if(!Array.isArray(gold)||gold.length===0)return null;
  const selected=new Set(hits.slice(0,k).map(x=>typeof x==="string"?x:x.id));
  return gold.filter(id=>selected.has(id)).length / gold.length;
}
export function evaluate(index,cases,{k=5}={}) {
  const rows=cases.map(c=>{
    const hits=retrieve(index,c.question,c.tenantId,{limit:k});
    const recall=recallAtK(hits,c.gold,k);
    const expectedAbstain=c.expectAbstain===true;
    const actualAbstain=hits.length===0; 
    const disallowed=(c.mustNotInclude||[]).filter(id=>hits.some(h=>h.id===id));
    return {question:c.question,tenant:c.tenantId,recall,
      expectedAbstain,actualAbstain,privacyPass:disallowed.length===0,
      ids:hits.map(h=>h.id)};
  });
  const answerable=rows.filter(r=>r.recall!==null);
  const noEvidence=rows.filter(r=>r.expectedAbstain);
  return {
    cases:rows.length,
    meanRecallAtK:answerable.length?
       answerable.reduce((n,r)=>n+r.recall,0)/answerable.length:null,
    abstentionRate:noEvidence.length?
       noEvidence.filter(r=>r.actualAbstain).length/noEvidence.length:null,
    privacyFailures:rows.filter(r=>!r.privacyPass).length,
    rows
  };
}
// This only tests lexical retrieval, NOT final model answer truth.
// A production RAG eval needs claim support and human-labeled correctness.
