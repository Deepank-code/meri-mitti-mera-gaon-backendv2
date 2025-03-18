import { rm } from "fs";
import { myCache } from "../app.js";

import { TryCatch } from "../midlewares/error.js";
import { Product } from "../models/product.js";
import {
  deleteFromCloudinary,
  invalidateCache,
  uploadToCloudinary,
} from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";

import {
  BaseQuery,
  newProductTypes,
  SearchRequestQuery,
} from "../types/types.js";
import { Request } from "express";
import { User } from "../models/user.js";
import { Review } from "../models/review.js";

export const getlatestProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-products"))
    products = JSON.parse(myCache.get("latest-products") as string);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }
  return res.status(200).json({
    success: true,
    products,
  });
});
// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({
    success: true,
    categories,
  });
});
// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products") as string);
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }
  return res.status(200).json({
    success: true,
    products,
  });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));
  }
  return res.status(200).json({
    success: true,
    product,
  });
});
export const newProduct = TryCatch(async (req, res, next) => {
  const { name, price, stock, category, description, ratings } = req.body;
  const photos = req.files as Express.Multer.File[] | undefined;
  console.log(req.body);
  if (!photos) return next(new ErrorHandler("Please add Photo", 400));
  if (photos.length < 1) {
    return next(new ErrorHandler("upload at least 1 photo", 400));
  }
  if (photos.length > 5) {
    return next(new ErrorHandler("you can upload only 5 photo", 400));
  }
  if (!name || !price || !description || !stock || !category) {
    return next(new ErrorHandler("Please enter All Fields", 400));
  }
  const photosUrl = await uploadToCloudinary(photos!);
  await Product.create({
    name,
    price,
    stock,
    ratings,
    description,
    category: category.toLowerCase(),
    photos: photosUrl,
  });
  invalidateCache({ product: true, admin: true });
  return res.status(201).json({
    success: true,
    message: "Product Created Successfully",
  });
});
export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category, description } = req.body;
  const photos = req.files as Express.Multer.File[] | undefined;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  if (photos && photos.length > 0) {
    const photoUrl = await uploadToCloudinary(photos);

    const ids = product.photos.map((photo) => photo.public_id);

    await deleteFromCloudinary(ids);
    product.photos = photoUrl;
  }
  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;
  await product.save();
  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const ids = product.photos?.map((photo) => photo.public_id) || [];

  try {
    if (ids.length > 0) {
      await deleteFromCloudinary(ids);
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }

  await product.deleteOne();
  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    // 1,2,3,4,5,6,7,8
    // 9,10,11,12,13,14,15,16
    // 17,18,19,20,21,22,23,24
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery: BaseQuery = {};
    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };
    if (category) baseQuery.category = category;
    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);
    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
export const newReview = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("user not found", 404));
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  const { comment, rating } = req.body;
  let alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  try {
    if (alreadyReviewed) {
      alreadyReviewed.comment = comment;
      alreadyReviewed.rating = rating;
      await alreadyReviewed.save();
    } else {
      await Review.create({
        comment,
        rating,
        user: user?._id,
        product: product?._id,
      });
    }
  } catch (error) {
    console.log(error);
  }
  let totalRating = 0;
  const reviews = await Review.find({ product: product?._id });
  reviews.forEach((review) => {
    totalRating += review.rating;
  });
  const averageRating = Math.floor(totalRating / reviews.length) || 0;
  product.ratings = averageRating;
  product.numofReviews = reviews.length;
  await product.save();
  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed
      ? "Review Updated"
      : "Your Review added Successfully",
  });
});
export const deleteReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("user not found", 404));

  const { id } = req.params;
  const review = await Review.findOne({
    product: id,
  });
  if (!review) next(new ErrorHandler("Can't delete Review", 400));
  const isAuthenticUser = review?.user.toString() === user._id;
  if (!isAuthenticUser) return next(new ErrorHandler("Not Authorized", 401));

  await review.deleteOne();
  const product = await Product.findById(review.product);
  if (!product) return next(new ErrorHandler("Can't find product", 404));
  let totalRating = 0;
  const reviews = await Review.find({ product: product?._id });
  reviews.forEach((review) => {
    totalRating += review.rating;
  });
  const averageRating = Math.floor(totalRating / reviews.length) || 0;
  product.ratings = averageRating;
  product.numofReviews = reviews.length;
  await product.save();
  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
export const getAllReviews = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const all_reviews = await Review.find({
    product: id,
  })
    .limit(2)
    .populate("user", "name photo")
    .sort({ updatedAt: -1 });
  if (!all_reviews) next(new ErrorHandler("Can't fetch all Reviews", 404));

  return res.status(200).json({
    success: true,
    all_reviews,
  });
});
