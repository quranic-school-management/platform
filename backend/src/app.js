const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// ── Health check (public) ───────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 & error handler ─────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

module.exports = app;
