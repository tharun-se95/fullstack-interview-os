import { app } from "./app.mjs";
import { pool } from "./db.mjs";

const port=Number(process.env.PORT??3001);
if(!Number.isInteger(port)||port<1||port>65535)throw Error("Invalid PORT");
const server=app.listen(port,()=>{
 console.log(JSON.stringify({level:"info",message:"Local training API listening",port}));
});
let stopping=false;
async function shutdown(signal){
 if(stopping)return;
 stopping=true;
 console.log(JSON.stringify({level:"info",message:"Stopping",signal}));
 server.close(async error=>{
   try {await pool.end()}
   finally {process.exit(error?1:0)}
 });
 setTimeout(()=>{
   console.error("Shutdown deadline exceeded");
   process.exit(1);
 },10000).unref();
}
process.on("SIGTERM",()=>shutdown("SIGTERM"));
process.on("SIGINT",()=>shutdown("SIGINT"));
