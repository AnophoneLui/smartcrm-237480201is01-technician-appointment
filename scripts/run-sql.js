// Chạy mọi tệp .sql trong một thư mục (theo thứ tự tên). Tự đọc .env nên chạy được trên Windows/macOS/Linux.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("Cách dùng: node scripts/run-sql.js <thư-mục-chứa-sql>");
  if (!process.env.DATABASE_URL) throw new Error("Thiếu DATABASE_URL. Hãy tạo .env từ .env.example.");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const f of files) {
      await client.query(fs.readFileSync(path.join(dir, f), "utf8"));
      console.log("OK", f);
    }
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
