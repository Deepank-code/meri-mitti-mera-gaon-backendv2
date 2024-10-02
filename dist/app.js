import express from "express";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./midlewares/error.js";
import NodeCache from "node-cache";
const port = 8000;
const app = express();
connectDB();
export const myCache = new NodeCache();
app.use(express.json());
//using routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
app.listen(port, () => {
    console.log("server is running on PORT:" + port);
});
