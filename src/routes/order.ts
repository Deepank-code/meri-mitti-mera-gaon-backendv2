import express from "express";

import { adminOnly } from "../midlewares/auth.js";

const app = express.Router();

app.post("/new", newOrder);

export default app;
