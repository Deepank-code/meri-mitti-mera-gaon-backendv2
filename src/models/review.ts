import { timeStamp } from "console";
import mongoose from "mongoose";
import { mainModule } from "process";

const ReviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Please enter the comment!"],
      maxLength: [150, "comment length can't be greater than 150"],
    },
    rating: {
      type: Number,
      required: [true, "Please give rating"],
      min: [0, "you can give at least 0 rating"],
      max: [5, "you can give max 5 rating"],
    },
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", ReviewSchema);
