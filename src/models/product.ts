import mongoose from "mongoose";

interface Product extends Document {
  name: string;

  photos: { url: string; public_id: string }[];
  price: string;
  stock: number;
  category: string;
  description: string;
  ratings: number;
  numofReviews: number;
}
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter name"],
    },
    photos: [
      {
        public_id: {
          type: String,
          required: [true, "please enter public id"],
        },
        url: {
          type: String,
          required: [true, "please enter Url"],
        },
      },
    ],
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
    description: {
      type: String,
      required: [true, "Please enter description"],
    },
    ratings: {
      type: Number,

      default: 0,
    },
    numofReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<Product>("Product", productSchema);
