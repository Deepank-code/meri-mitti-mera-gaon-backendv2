import express from "express";
import {
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getAllReviews,
  getlatestProducts,
  getSingleProduct,
  newProduct,
  newReview,
  updateProduct,
} from "../controllers/productController.js";
import { multiUpload, singleUpload } from "../midlewares/multer.js";
import { adminOnly } from "../midlewares/auth.js";

const app = express.Router();
app.post("/new", adminOnly, multiUpload, newProduct);

app.get("/all", getAllProducts);
app.get("/latest", getlatestProducts);
app.get("/categories", getAllCategories);
app.get("/admin-products", adminOnly, getAdminProducts);

app
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, multiUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

app.get("/all-reviews/:id", getAllReviews);
app.post("/review/new/:id", newReview);
app.delete("/review/:id", deleteReview);
export default app;
