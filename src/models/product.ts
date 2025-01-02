import mongoose from "mongoose";

interface Product extends Document {
  name: string;

  photo: string;
  price: string;
  stock: number;
  category: string;
}
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter name"],
    },
    photo: {
      public_id: {
        type: String,
        required: [true, "please enter public id"],
      },
      url: {
        type: String,
        required: [true, "please enter Url"],
      },
    },
    price: {
      type: String,
      required: [true, "please enter price"],
    },
    stock: {
      type: Number,
      required: [true, "please enter stock"],
    },
    category: {
      type: String,
      required: [true, "please enter Category"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<Product>("Product", productSchema);
