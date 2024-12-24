import mongoose from "mongoose";
import { InvalidateCacheProps, orderItemsType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "meraGaon",
    })
    .then((c) => console.log("DB connect to " + c.connection.host))
    .catch((e) => console.log(e));
};

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];
    if (typeof productId === "string") productKeys.push(`product-${productId}`);
    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${productId}`));

    myCache.del(productKeys);
  }
  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];

    myCache.del(ordersKeys);
  }
  if (admin) {
    myCache.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems: orderItemsType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product not found");

    product.stock -= order.quantity;
    await product.save();
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percentage = (thisMonth / lastMonth) * 100;
  return Number(percentage.toFixed(0));
};

export const getInventories = async ({
  categories,
  productCount,
}: {
  categories: string[];
  productCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) => {
    return Product.countDocuments({ category });
  });

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];
  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productCount) * 100),
    });
  });
  return categoryCount;
};
interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}
export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: {
  length: number;
  docArr: MyDocument[];

  today: Date;
  property?: "discount" | "total";
}) => {
  const data: number[] = new Array(length).fill(0);
  docArr.forEach((i) => {
    const creationDate: Date = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });
  return data;
};
