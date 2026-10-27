import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createIndex} from "../src/retrieval.js";
import {evaluate,recallAtK} from "../src/eval.js";
const docs=JSON.parse(await readFile(new URL("../data/policies.json",import.meta.url)));
const cases=JSON.parse(await readFile(new URL("../data/gold-questions.json",import.meta.url)));
test("recall@k measures gold IDs",()=>{
 assert.equal(recallAtK([{id:"A"},{id:"B"}],["B"],1),0);
 assert.equal(recallAtK([{id:"A"},{id:"B"}],["B"],2),1);
 assert.equal(recallAtK([],[],5),null);
});
test("evaluation reports bounded expected categories",()=>{
 const report=evaluate(createIndex(docs),cases,{k:5});
 assert.equal(report.cases,cases.length);
 assert.equal(report.privacyFailures,0);
 assert.ok(report.meanRecallAtK!==null);
 assert.ok(report.rows.filter(x=>x.expectedAbstain).length>=1);
});
