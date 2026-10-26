import { readFile } from "node:fs/promises";
import { pool } from "../src/db.mjs";
try {
 const sql=await readFile(new URL("../sql/001_init.sql",import.meta.url),"utf8");
 await pool.query(sql);
 console.log("Training schema ready (two demo tenants).");
}catch(error){
 console.error("Migration failed:",error.message);
 process.exitCode=1;
}finally{
 await pool.end();
}
