require("dotenv").config();

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Thiếu DATABASE_URL. Hãy tạo file .env từ .env.example.");
}

const pool = new Pool({ connectionString });

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  close: () => pool.end()
};
