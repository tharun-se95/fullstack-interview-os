import pg from "pg";
const {Pool}=pg;
if(!process.env.DATABASE_URL)throw Error("DATABASE_URL is required");
export const pool=new Pool({
 connectionString:process.env.DATABASE_URL,
 max:5,connectionTimeoutMillis:3000,idleTimeoutMillis:10000
});
pool.on("error",err=>console.error(JSON.stringify({
 level:"error",component:"pg-pool",message:err.message
})));
