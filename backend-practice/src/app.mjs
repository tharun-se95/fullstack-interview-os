import express from "express";
import { z, ZodError } from "zod";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { pool } from "./db.mjs";

/**
 * LOCAL TRAINING APP ONLY.
 * Two fixed demo API keys stand in for an authenticated identity provider.
 * Replace with audited OIDC/session authentication before ANY public deployment.
 */
const keys=[
  [process.env.DEMO_API_KEY_A,"tenant-a"],
  [process.env.DEMO_API_KEY_B,"tenant-b"]
];
if(keys.some(([key])=>!key||key.length<24)||keys[0][0]===keys[1][0]){
  throw new Error("Set two DISTINCT demo API keys (24+ chars) in .env");
}
const compare=(a,b)=>{
  const aa=Buffer.from(a),bb=Buffer.from(b);
  return aa.length===bb.length&&timingSafeEqual(aa,bb);
};
const fail=(status,code)=>Object.assign(new Error(code),{status,code});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const inputSchema=z.object({title:z.string().trim().min(3).max(120)}).strict();
const patchSchema=z.object({
  title:z.string().trim().min(3).max(120).optional(),
  status:z.enum(["open","done"]).optional()
}).strict().refine(x=>x.title!==undefined||x.status!==undefined);
const toDTO=row=>({
  id:row.id,title:row.title,status:row.status,
  createdAt:new Date(row.created_at).toISOString()
});
const checkId=id=>{if(!uuid.test(id))throw fail(400,"INVALID_ID");return id};
function authenticate(req,res,next){
  const raw=req.get("authorization")||"";
  const match=/^Bearer ([^\s]+)$/.exec(raw);
  const found=match&&keys.find(([k])=>compare(k,match[1]));
  if(!found)return res.status(401).json({code:"UNAUTHENTICATED",requestId:req.requestId});
  req.actor={tenantId:found[1]};
  next();
}
function limitParam(value){
  if(value===undefined)return 20;
  if(!/^[1-9]\d*$/.test(String(value)))throw fail(400,"INVALID_LIMIT");
  const n=Number(value);
  if(!Number.isSafeInteger(n)||n>50)throw fail(400,"INVALID_LIMIT");
  return n;
}
function decodeCursor(value){
  if(value===undefined)return null;
  if(typeof value!=="string"||value.length>512||!/^[\w-]+$/.test(value)){
    throw fail(400,"INVALID_CURSOR");
  }
  try {
    const [date,id]=JSON.parse(Buffer.from(value,"base64url").toString("utf8"));
    if(typeof date!=="string"||!Number.isFinite(Date.parse(date))||
       typeof id!=="string"||!uuid.test(id))throw Error("invalid");
    return [date,id];
  } catch{throw fail(400,"INVALID_CURSOR")}
}
const encodeCursor=row=>Buffer.from(JSON.stringify([
  new Date(row.created_at).toISOString(),row.id
])).toString("base64url");

export const app=express();
app.disable("x-powered-by");
app.use((req,res,next)=>{
  req.requestId=randomUUID();
  res.set("X-Request-ID",req.requestId);
  const started=performance.now();
  res.on("finish",()=>console.log(JSON.stringify({
    requestId:req.requestId,method:req.method,
    path:req.route?.path??req.path,status:res.statusCode,
    durationMs:Math.round(performance.now()-started)
  })));
  next();
});
app.use(express.json({limit:"32kb"}));
app.get("/health",(req,res)=>res.json({status:"alive"}));
app.get("/ready",async(req,res)=>{
  try {await pool.query("SELECT 1");res.json({status:"ready"})}
  catch {res.status(503).json({status:"unready"})}
});
app.use("/api",authenticate);

app.get("/api/tasks",async(req,res)=>{
  const tenantId=req.actor.tenantId;
  const limit=limitParam(req.query.limit);
  const status=req.query.status;
  if(status!==undefined&&!["open","done"].includes(status)){
    throw fail(400,"INVALID_STATUS");
  }
  const cursor=decodeCursor(req.query.cursor);
  const values=[tenantId];
  let where="tenant_id=$1";
  if(status!==undefined){values.push(status);where+=" AND status=$"+values.length}
  if(cursor){
    values.push(cursor[0],cursor[1]);
    where+=" AND (created_at,id)<($"+(values.length-1)+"::timestamptz,$"+values.length+"::uuid)";
  }
  values.push(limit+1);
  const text="SELECT id,title,status,created_at FROM tasks WHERE "+where+
    " ORDER BY created_at DESC,id DESC LIMIT $"+values.length;
  const result=await pool.query(text,values);
  const hasNext=result.rows.length>limit;
  const page=result.rows.slice(0,limit);
  res.json({
    items:page.map(toDTO),
    nextCursor:hasNext?encodeCursor(page[page.length-1]):null
  });
});

app.get("/api/tasks/:id",async(req,res)=>{
  const id=checkId(req.params.id);
  const {rows}=await pool.query(
    "SELECT id,title,status,created_at FROM tasks WHERE tenant_id=$1 AND id=$2",
    [req.actor.tenantId,id]
  );
  if(!rows.length)throw fail(404,"TASK_NOT_FOUND");
  res.json(toDTO(rows[0]));
});

app.post("/api/tasks",async(req,res)=>{
  const parsed=inputSchema.parse(req.body);
  const key=req.get("idempotency-key");
  if(!key||!/^[a-zA-Z0-9_-]{8,128}$/.test(key)){
    throw fail(400,"INVALID_IDEMPOTENCY_KEY");
  }
  const tenantId=req.actor.tenantId;
  const fingerprint=createHash("sha256").update(JSON.stringify(parsed)).digest("hex");
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    const {rows:claimed}=await client.query(
      "INSERT INTO request_dedupe(tenant_id,key,request_hash) VALUES($1,$2,$3) "+
      "ON CONFLICT DO NOTHING RETURNING key",
      [tenantId,key,fingerprint]
    );
    if(!claimed.length){
      // ON CONFLICT waits for an in-flight winner to commit/rollback.
      // READ COMMITTED makes the committed record visible to this next SELECT.
      const {rows:existing}=await client.query(
        "SELECT request_hash,task_id FROM request_dedupe WHERE tenant_id=$1 AND key=$2",
        [tenantId,key]
      );
      if(!existing.length)throw fail(409,"IDEMPOTENCY_CONFLICT");
      if(existing[0].request_hash!==fingerprint){
        throw fail(409,"IDEMPOTENCY_KEY_REUSED");
      }
      const {rows}=await client.query(
        "SELECT id,title,status,created_at FROM tasks WHERE tenant_id=$1 AND id=$2",
        [tenantId,existing[0].task_id]
      );
      if(!rows.length)throw fail(410,"ORIGINAL_RESOURCE_GONE");
      await client.query("COMMIT");
      return res.status(200).json(toDTO(rows[0]));
    }
    const {rows}=await client.query(
      "INSERT INTO tasks(tenant_id,title) VALUES($1,$2) RETURNING id,title,status,created_at",
      [tenantId,parsed.title]
    );
    await client.query(
      "UPDATE request_dedupe SET task_id=$3 WHERE tenant_id=$1 AND key=$2",
      [tenantId,key,rows[0].id]
    );
    await client.query("COMMIT");
    res.status(201).location("/api/tasks/"+rows[0].id).json(toDTO(rows[0]));
  }catch(error){
    await client.query("ROLLBACK").catch(()=>{});
    throw error;
  }finally{client.release()}
});

app.patch("/api/tasks/:id",async(req,res)=>{
  const id=checkId(req.params.id);
  const data=patchSchema.parse(req.body);
  const {rows}=await pool.query(
    "UPDATE tasks SET title=COALESCE($3,title),status=COALESCE($4,status) "+
    "WHERE tenant_id=$1 AND id=$2 RETURNING id,title,status,created_at",
    [req.actor.tenantId,id,data.title??null,data.status??null]
  );
  if(!rows.length)throw fail(404,"TASK_NOT_FOUND");
  res.json(toDTO(rows[0]));
});

app.use((req,res)=>res.status(404).json({
  code:"ROUTE_NOT_FOUND",requestId:req.requestId
}));
app.use((err,req,res,next)=>{
  if(res.headersSent)return next(err);
  const validation=err instanceof ZodError;
  const isSyntax=err.type==="entity.parse.failed";
  const tooLarge=err.type==="entity.too.large";
  const status=validation||isSyntax?400:tooLarge?413:err.status??500;
  const code=validation?"INVALID_BODY":isSyntax?"INVALID_JSON":
    tooLarge?"PAYLOAD_TOO_LARGE":err.code&&status<500?err.code:"INTERNAL_ERROR";
  if(status>=500)console.error(JSON.stringify({
    requestId:req.requestId,error:err.message
  }));
  res.status(status).json({
    code,requestId:req.requestId,
    ...(validation?{issues:err.issues.map(x=>({
      path:x.path.join("."),code:x.code
    }))}:{})
  });
});
