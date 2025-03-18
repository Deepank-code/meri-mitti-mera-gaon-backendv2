import multer from "multer";

export const singleUpload = multer().single("photo");
export const multiUpload = multer().array("photos", 5);
