import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

try {
  await pool.query(schema);
  console.log("Database schema applied successfully.");
} catch (err) {
  console.error("Database init failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
