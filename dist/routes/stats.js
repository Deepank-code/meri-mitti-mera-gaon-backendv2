import express from "express";
import { adminOnly } from "../midlewares/auth.js";
import { getBarChart, getDashboardStats, getLineChart, getPieChart, } from "../controllers/stats.js";
const app = express.Router();
app.get("/stats", getDashboardStats);
app.get("/pie", adminOnly, getPieChart);
app.get("/bar", adminOnly, getBarChart);
app.get("/line", adminOnly, getLineChart);
export default app;
