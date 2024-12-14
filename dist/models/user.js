import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "please enter ID"],
    },
    name: {
        type: String,
        required: [true, "please enter name"],
    },
    email: {
        type: String,
        unique: [true, "Email already Exist"],
        required: [true, "please enter name"],
        validate: validator.default.isEmail,
    },
    photo: {
        type: String,
        required: [true, "please Upload photo"],
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "please enter Gender"],
    },
    dob: {
        type: Date,
        required: [true, "please enter dob"],
    },
}, {
    timestamps: true,
});
userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
});
export const User = mongoose.model("User", userSchema);
