const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const client = require("prom-client");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
});

const dbQueryCounter = new client.Counter({
  name: "db_queries_total",
  help: "Total database queries",
  labelNames: ["operation"],
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);
register.registerMetric(dbQueryCounter);

// Middleware
app.use(cors());
app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestCounter
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Database connection (existing code)
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "mahasiswa_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Database connected successfully");
  }
});

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// GET all mahasiswa
app.get("/api/mahasiswa", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM mahasiswa ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single mahasiswa by ID
app.get("/api/mahasiswa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM mahasiswa WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE new mahasiswa
app.post("/api/mahasiswa", async (req, res) => {
  try {
    const { nim, nama, jurusan, angkatan } = req.body;

    if (!nim || !nama || !jurusan || !angkatan) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO mahasiswa (nim, nama, jurusan, angkatan) VALUES ($1, $2, $3, $4) RETURNING *",
      [nim, nama, jurusan, angkatan]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "NIM already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});
// UPDATE mahasiswa
app.put("/api/mahasiswa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nim, nama, jurusan, angkatan } = req.body;

    if (!nim || !nama || !jurusan || !angkatan) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "UPDATE mahasiswa SET nim = $1, nama = $2, jurusan = $3, angkatan = $4 WHERE id = $5 RETURNING *",
      [nim, nama, jurusan, angkatan, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE mahasiswa
app.delete("/api/mahasiswa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM mahasiswa WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    res.json({ message: "Mahasiswa deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
