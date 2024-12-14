import express from "express";
import Stripe from "stripe";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./midlewares/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import cors from "cors";
//importing routes
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import dashboardRoutes from "./routes/stats.js";
config({
    path: "./.env",
});
const port = process.env.PORT || 4000;
const MONGOURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
connectDB(MONGOURI);
const app = express();
export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();
app.use(express.json());
app.use(cors());
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
app.listen(port, () => {
    console.log("server is running on PORT:" + port);
});
