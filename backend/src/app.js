const express = require("express");
const cors = require("cors");
// const authMiddleware = require("./middleware/authMiddleware"); not implimented yet
const errorHandler = require("./middleware/errorHandler");
// const authRoutes = require("./routes/auth"); example

const app = express();

app.use(cors());

app.use(express.json());
// app.use(authMiddleware); not implimented yet

// app.use("/api/auth", authRoutes); example

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

module.exports = app;
