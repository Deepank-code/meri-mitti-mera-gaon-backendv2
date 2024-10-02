import express from "express";
import { deleteProduct, getAdminProduct, getAllProduct, getCategories, getlatestProduct, getSingleProducts, newProduct, updateProduct, } from "../controllers/productController.js";
import { singleUpload } from "../midlewares/multer.js";
import { adminOnly } from "../midlewares/auth.js";
const app = express.Router();
app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/all", getAllProduct);
app.get("/latest", getlatestProduct);
app.get("/categories", getCategories);
app.get("/admin-products", adminOnly, getAdminProduct);
app
    .route("/:id")
    .get(getSingleProducts)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);
export default app;
