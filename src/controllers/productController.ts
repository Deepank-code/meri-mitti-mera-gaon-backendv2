import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../midlewares/error.js";
import {
  BaseQuery,
  newProductTypes,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, newProductTypes>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, category, price, stock } = req.body;

    const photo = req.file;
    if (!photo) return next(new ErrorHandler("please add photo", 400));

    if (!name || !category || !price || !stock) {
      rm(photo.path, () => console.log("deleted"));
      return next(new ErrorHandler("please enter all fields ", 400));
    }
    await Product.create({
      name,
      category: category.toLowerCase(),
      price,
      stock,
      photo: photo?.path,
    });
    invalidateCache({ product: true, admin: true });
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  }
);

//revalidate on new , update ,delete product
export const getlatestProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products;
    if (myCache.has("latest-product")) {
      products = JSON.parse(myCache.get("latest-product") as string);
    } else {
      const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      myCache.set("latest-product", JSON.stringify(products));
    }

    return res.status(201).json({
      success: true,
      message: products,
    });
  }
);
//revalidate on new , update ,delete product and new order

export const getCategories = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let categories;

    if (myCache.has("categories")) {
      categories = JSON.parse(myCache.get("categories") as string);
    } else {
      const categories = await Product.distinct("category");
      myCache.set("categories", JSON.stringify(categories));
    }

    return res.status(201).json({
      success: true,
      categories,
    });
  }
);

export const getAdminProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products;
    if (myCache.has("all-product")) {
      products = JSON.parse(myCache.get("all-product") as string);
    } else {
      const products = await Product.find({});
      myCache.set("all-product", JSON.stringify(products));
    }

    return res.status(201).json({
      success: true,
      products,
    });
  }
);
export const getSingleProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id;
    let product;
    if (myCache.has(`product-${id}`)) {
      product = JSON.parse(myCache.get(`product-${id}`) as string);
    } else {
      const product = await Product.findById(id);
      if (!product) return next(new ErrorHandler("Product not found", 404));
      myCache.set(`product-${id}`, JSON.stringify(product));
    }

    return res.status(201).json({
      success: true,

      product,
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const { name, category, price, stock } = req.body;
  console.log(name, category, price, stock);
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("product not found", 404));

  if (photo) {
    rm(product.photo, () => console.log("old photo deleted"));
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  product.save();
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  return res.status(201).json({
    success: true,
    message: "Product updated successfully",
  });
});
export const deleteProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    rm(product?.photo!, () => console.log("Product photo deleted"));

    await Product.deleteOne();

    invalidateCache({
      product: true,
      productId: String(product!._id),
      admin: true,
    });
    return res.status(201).json({
      success: true,
      message: "Product deleted succesfully",
    });
  }
);
export const getAllProduct = TryCatch(
  async (
    req: Request<{}, {}, {}, SearchRequestQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit: any = process.env.PRODUCT_PER_PAGE || 8;
    const skip = (page - 1) * limit;
    const baseQuery: BaseQuery = {};
    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      baseQuery.category = category;
    }

    const [products, filteredOnlyProduct] = await Promise.all([
      await Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip),
      Product.find(baseQuery),
    ]);
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(201).json({
      success: true,
      products,
      totalPage,
    });
  }
);
