require("dotenv").config();
const pool = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("DB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
}

start();
