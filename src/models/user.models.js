import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const passwordRegex =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+=\-\[\]{};:'"\\,.<>\/|?]).{8,}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User's name is required "],
      min: 2,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already taken"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    validate: {
      validator: (value) => passwordRegex.test(value),
      message:
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character",
    },
  },
  { timestamps: true },
);




userSchema.pre("save", async function(next){
    if(!this.isModified("password"))return next();

    this.password = await bcrypt.hash(this.password, 12);
})




userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;
