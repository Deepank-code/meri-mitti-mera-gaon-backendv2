import mongoose from "mongoose";
import { InvalidateCacheProps } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";

export const connectDB = () => {
  mongoose
    .connect("mongodb://localhost:27017", {
      dbName: "meraGaon",
    })
    .then((c) => console.log("DB connect to " + c.connection.host))
    .catch((e) => console.log(e));
};

export const invalidateCache = async ({
  product,
  order,
  admin,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-product",
      "categories",
      "all-product",
    ];

    const products = await Product.find({}).select("_id");

    products.forEach((i) => productKeys.push(`product-${i._id}`));
    myCache.del(productKeys);
  }
  if (order) {
  }
  if (admin) {
  }
};
