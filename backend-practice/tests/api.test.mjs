import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { app } from "../src/app.mjs";
import { pool } from "../src/db.mjs";

let server,base;
const keyA=process.env.DEMO_API_KEY_A;
const keyB=process.env.DEMO_API_KEY_B;
before(async()=>{
  await pool.query("SELECT id FROM tenants LIMIT 1");
  await new Promise(resolve=>{
    server=app.listen(0,"127.0.0.1",resolve);
  });
  base="http://127.0.0.1:"+server.address().port;
});
after(async()=>{
  if(server)await new Promise(resolve=>server.close(resolve));
  await pool.end();
});
async function call(path,token,options={}){
  const headers={...(options.body?{"content-type":"application/json"}:{}),
    ...(token?{authorization:"Bearer "+token}:{}),
    ...(options.key?{"Idempotency-Key":options.key}:{}),
  };
  const response=await fetch(base+path,{
    method:options.method??"GET",
    headers,
    ...(options.body?{body:JSON.stringify(options.body)}:{})
  });
  return {status:response.status,data:await response.json(),response};
}
const key=()=> "req-"+randomUUID();
test("liveness and missing identity",async()=>{
  assert.equal((await call("/health")).status,200);
  assert.equal((await call("/api/tasks")).status,401);
});
test("invalid payloads are rejected, including privilege injection",async()=>{
  assert.equal((await call("/api/tasks",keyA,{method:"POST",key:key(),
    body:{title:"x"}})).status,400);
  assert.equal((await call("/api/tasks",keyA,{method:"POST",key:key(),
    body:{title:"Valid title",role:"admin"}})).status,400);
});
test("create and replay have one durable resource",async()=>{
  const token=key();
  const options={method:"POST",key:token,body:{title:"Demo "+randomUUID()}};
  const first=await call("/api/tasks",keyA,options);
  const replay=await call("/api/tasks",keyA,options);
  assert.equal(first.status,201);
  assert.equal(replay.status,200);
  assert.equal(first.data.id,replay.data.id);
  assert.equal((await call("/api/tasks",keyA,{
    ...options,body:{title:"Different payload"}
  })).status,409);
});
test("parallel duplicates share one logical creation",async()=>{
  const token=key(),body={title:"Race "+randomUUID()};
  const [a,b]=await Promise.all([
    call("/api/tasks",keyA,{method:"POST",key:token,body}),
    call("/api/tasks",keyA,{method:"POST",key:token,body})
  ]);
  assert.deepEqual([a.status,b.status].sort(),[200,201]);
  assert.equal(a.data.id,b.data.id);
});
test("tenant boundaries hold for reads and updates",async()=>{
  const created=await call("/api/tasks",keyA,{method:"POST",
    key:key(),body:{title:"Isolated "+randomUUID()}});
  const id=created.data.id;
  assert.equal((await call("/api/tasks/"+id,keyB)).status,404);
  assert.equal((await call("/api/tasks/"+id,keyB,{
    method:"PATCH",body:{status:"done"}
  })).status,404);
  assert.equal((await call("/api/tasks/"+id,keyA)).status,200);
  assert.equal((await call("/api/tasks/"+id,keyA,{
    method:"PATCH",body:{status:"done"}
  })).data.status,"done");
});
test("bounded pagination and malformed cursors",async()=>{
  assert.equal((await call("/api/tasks?limit=999",keyA)).status,400);
  assert.equal((await call("/api/tasks?cursor=not-a-valid-cursor",keyA)).status,400);
  const first=await call("/api/tasks?limit=1",keyA);
  assert.equal(first.status,200);
  assert.ok(first.data.items.length<=1);
  if(first.data.nextCursor){
    const second=await call(
      "/api/tasks?limit=1&cursor="+encodeURIComponent(first.data.nextCursor),keyA);
    assert.equal(second.status,200);
    assert.notEqual(second.data.items[0]?.id,first.data.items[0]?.id);
  }
});
