import { TryCatch } from "../midlewares/error.js";
import { Coupon } from "../models/payment.js";
import ErrorHandler from "../utils/utility-class.js";

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount)
    return next(new ErrorHandler("Please enter both field", 400));
  await Coupon.create({ coupon, amount });
  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} created Successfully!`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ coupon: coupon });
  if (!discount) return next(new ErrorHandler("Invalid coupon Code", 400));

  return res.status(201).json({
    success: true,
    discount: discount.amount,
  });
});
export const allCoupons = TryCatch(async (req, res, next) => {
  const allCoupon = await Coupon.find();
  if (!allCoupon) return next(new ErrorHandler("coupons are not found", 400));

  return res.status(201).json({
    success: true,
    allCoupon,
  });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) next(new ErrorHandler("Invalid coupon id", 400));
  return res.status(201).json({
    success: true,
    message: "coupon Deleted successfully",
  });
});
