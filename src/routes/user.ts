import express from "express";
import {
  getAllUser,
  newUser,
  getUser,
  deleteUser,
} from "../controllers/userController.js";
import { adminOnly } from "../midlewares/auth.js";

const app = express.Router();

app.post("/new", newUser);
app.get("/all", adminOnly, getAllUser);
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default app;
