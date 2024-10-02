import express from "express";
const app = express.Router();
app.post("/new", newOrder);
export default app;
