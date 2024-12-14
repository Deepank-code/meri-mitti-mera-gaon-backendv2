import express from "express";
import { adminOnly } from "../midlewares/auth.js";
import { allCoupons, applyDiscount, deleteCoupon, newCoupon, } from "../controllers/payment.js";
const app = express.Router();
app.post("/coupon/new", newCoupon);
app.get("/discount", applyDiscount);
app.get("/all-coupon", adminOnly, allCoupons);
app.delete("/coupon/:id", adminOnly, deleteCoupon);
export default app;
