// Offline, dependency-free retrieval baseline. NOT a vector embedding service.
// Upgrade to hybrid BM25 + pgvector in the course workshop after measuring recall.
const STOP=new Set(["a","an","the","to","and","or","is","in","of","for","on","be","do","does","are","at","with","what","how","should","can","i","me","my","when","where","who"]);
export function terms(value) {
  return [...new Set(String(value).toLowerCase()
    .replace(/[^a-z0-9-]+/g," ").split(/\s+/)
    .filter(x=>x.length>1&&!STOP.has(x)))];
}
export function createIndex(documents) {
  if(!Array.isArray(documents))throw new TypeError("documents must be array");
  const seen=new Set();
  return documents.filter(d=>{
    if(!d.active) return false;
    const key=[d.tenantId,d.documentId,d.revision].join(":");
    if(seen.has(key))return false;
    seen.add(key);return true;
  }).map(d=>Object.freeze({
    id:[d.tenantId,d.documentId,d.revision].join(":"),
    tenantId:d.tenantId,documentId:d.documentId,revision:d.revision,
    section:d.section,page:d.page,text:d.text,
    searchable:terms([d.documentId,d.section,d.text].join(" "))
  }));
}
export function retrieve(index,question,tenantId,{limit=5}={}) {
  if(!tenantId || typeof tenantId!=="string")throw new Error("trusted tenant is required");
  if(!Number.isInteger(limit)||limit<1||limit>20)throw new RangeError("limit must be 1–20");
  const q=terms(question);
  if(!q.length)return [];
  return index.filter(d=>d.tenantId===tenantId)
    .map(d=>{
      const bag=new Set(d.searchable);
      const matched=q.filter(t=>bag.has(t));
      const exactCode = q.some(t=>t.toUpperCase()===d.documentId.toUpperCase());
      // Simple deterministic lexical score. Not BM25, vectors or learned ranking.
      const score=matched.length + (exactCode?5:0);
      return {...d,matched,score};
    })
    .filter(d=>d.score>0)
    .sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id))
    .slice(0,limit)
    .map(({searchable,...safe})=>safe);
}
export function makeEvidencePacket(hits) {
  return hits.map(x=>({id:x.id,documentId:x.documentId,
    revision:x.revision,page:x.page,section:x.section,text:x.text}));
}
export function validateCitations(claims,hits) {
  const allowed=new Set(hits.map(h=>h.id));
  return Array.isArray(claims)&&claims.length>0&&claims.every(c=>
    typeof c.text==="string"&&Array.isArray(c.citations)&&
    c.citations.length>0&&c.citations.every(id=>allowed.has(id))
  );
}
// Citation identity is necessary, but not sufficient for semantic support.
