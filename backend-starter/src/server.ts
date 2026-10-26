import { createApp } from "./app.js";
import { createPool } from "./db.js";

if (process.env.NODE_ENV === "production") {
  throw new Error("This teaching starter uses demo auth. Implement real auth before production.");
}
const token = process.env.DEV_API_TOKEN;
if (!token) throw new Error("DEV_API_TOKEN is required");
const pool = createPool();
const port = Number(process.env.PORT || 3001);
const app = createApp({ db: pool, token });
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Backend workshop API on http://localhost:${port}`);
});
async function shutdown() {
  server.close();
  await pool.end();
}
process.on("SIGTERM", () => { shutdown().catch(console.error); });
process.on("SIGINT", () => { shutdown().catch(console.error); });
