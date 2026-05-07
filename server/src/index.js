import express from "express";
import cors from "cors";
import diagnoseRoutes from "./modules/diagnose/routes.js";
import matchRoutes from "./modules/match/routes.js";
import profileRoutes from "./modules/profile/routes.js";
import reportsRoutes from "./modules/reports/routes.js";
import roadmapRoutes from "./modules/roadmap/routes.js";
import trackRoutes from "./modules/track/routes.js";
import validateRoutes from "./modules/validate/routes.js";

const app = express();

// FIX: Add CORS so frontend on port 5173 can reach Express on 3001
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

app.get("/v1/health", (req, res) => {
  res.json({ status: "ok", service: "mentis-api" });
});

app.use("/v1/profile", profileRoutes);
app.use("/v1/diagnose", diagnoseRoutes);
app.use("/v1/match", matchRoutes);
app.use("/v1/validate", validateRoutes);
app.use("/v1/roadmap", roadmapRoutes);
app.use("/v1/track", trackRoutes);
app.use("/v1/reports", reportsRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`MENTIS API listening on ${port}`);
});
