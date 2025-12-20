import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import matchRoutes from "./routes/matches";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);

// Root route - helpful info
app.get("/", (req, res) => {
  res.json({
    message: "CoNekt API Server",
    status: "running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      users: "/api/users",
      matches: "/api/matches",
    },
    frontend: "Access the web app at http://localhost:5173",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CoNekt API is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend should be accessed at http://localhost:5173`);
});
