import { TryCatch } from "../midlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("please add photo", 400));
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
    return res.status(201).json({
        success: true,
        message: "Product created successfully",
    });
});
//revalidate on new , update ,delete product
export const getlatestProduct = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has("latest-product")) {
        products = JSON.parse(myCache.get("latest-product"));
    }
    else {
        const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-product", JSON.stringify(products));
    }
    return res.status(201).json({
        success: true,
        message: products,
    });
});
//revalidate on new , update ,delete product and new order
export const getCategories = TryCatch(async (req, res, next) => {
    const categories = await Product.distinct("category");
    return res.status(201).json({
        success: true,
        categories,
    });
});
export const getAdminProduct = TryCatch(async (req, res, next) => {
    const products = await Product.find({});
    return res.status(201).json({
        success: true,
        products,
    });
});
export const getSingleProducts = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    return res.status(201).json({
        success: true,
        product,
    });
});
export const updateProducts = TryCatch(async (req, res, next) => {
    const products = await Product.findById({});
    return res.status(201).json({
        success: true,
        products,
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const { name, category, price, stock } = req.body;
    console.log(name, category, price, stock);
    const photo = req.file;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("product not found", 404));
    if (photo) {
        rm(product.photo, () => console.log("old photo deleted"));
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    product.save();
    return res.status(201).json({
        success: true,
        message: "Product updated successfully",
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    rm(product?.photo, () => console.log("Product photo deleted"));
    await Product.deleteOne();
    return res.status(201).json({
        success: true,
        message: "Product deleted succesfully",
    });
});
export const getAllProduct = TryCatch(async (req, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = process.env.PRODUCT_PER_PAGE || 8;
    const skip = (page - 1) * limit;
    const baseQuery = {};
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
});
