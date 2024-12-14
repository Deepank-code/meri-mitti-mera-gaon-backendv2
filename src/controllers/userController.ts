import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { newUserTypes } from "../types/types.js";

import { TryCatch } from "../midlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, newUserTypes>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, _id, dob, gender } = req.body;

    let user = await User.findById(_id);
    if (user)
      return res.status(200).json({
        success: true,
        message: `welcome ${user.name}`,
      });
    if (!name || !email || !photo || !_id || !dob || !gender) {
      return next(new ErrorHandler("Please enter all Field!!!", 400));
    }
    user = await User.create({
      name,
      email,
      photo,
      _id,
      dob: new Date(dob),
      gender,
    });
    return res.status(201).json({
      success: true,
      message: `user name ${user.name} created successfully`,
    });
  }
);

export const getAllUser = TryCatch(async (req, res, next) => {
  const allUser = await User.find({});
  if (allUser) {
    return res.status(200).json({
      success: true,
      allUser,
    });
  }
});

export const getUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id: any = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("Invalid id", 400));
    }
    return res.status(200).json({
      success: true,
      user,
    });
  }
);
export const deleteUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id: any = req.params.id;
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("Invalid Id", 400));
    await user?.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User Deleted Succesfully",
    });
  }
);
