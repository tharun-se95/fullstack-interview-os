import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createIndex,retrieve,validateCitations} from "../src/retrieval.js";
const docs=JSON.parse(await readFile(new URL("../data/policies.json",import.meta.url)));
const index=createIndex(docs);
test("indexes only active revisions",()=>{
 assert.equal(index.some(x=>x.id==="clinic-a:SOP-CAL-042:1"),false);
 assert.equal(index.some(x=>x.id==="clinic-a:SOP-CAL-042:2"),true);
});
test("rejects cross-tenant retrieval",()=>{
 const hits=retrieve(index,"SOP-CAL-042 calibration","clinic-a");
 assert.ok(hits.length>0);
 assert.ok(hits.every(x=>x.tenantId==="clinic-a"));
 assert.ok(!hits.some(x=>x.id==="clinic-b:SOP-CAL-042:3"));
});
test("repeated documents are deduped",()=>{
 const twice=createIndex(docs.concat(docs));
 assert.equal(twice.length,index.length);
});
test("cited source must be among retrieved IDs",()=>{
 const hits=retrieve(index,"SOP-CAL-042 daily calibration","clinic-a");
 assert.equal(validateCitations([{text:"Clause",citations:[hits[0].id]}],hits),true);
 assert.equal(validateCitations([{text:"Clause",citations:["invented"]}],hits),false);
});
test("invalid limit fails closed",()=>{
 assert.throws(()=>retrieve(index,"calibration","clinic-a",{limit:100}),RangeError);
});
