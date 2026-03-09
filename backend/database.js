require("dotenv").config();
const sql = require("mssql");

const dbConfig = {
  user: process.env.DB_USER || "sa", // user SQL của bạn
  password: process.env.DB_PASSWORD || "MyStrongPass123", // mật khẩu SQL
  server: process.env.DB_SERVER || "localhost", // tên máy (đúng như SSMS)
  database: process.env.DB_DATABASE || "MenZoneBarber", // tên database
  options: {
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("✅ Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit if database connection fails
  }
}

module.exports = connectDB;