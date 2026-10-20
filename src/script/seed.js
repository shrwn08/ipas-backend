import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.models.js";

const admins = [
  {
    fullname: "Ramesh Singh",
    email: "rameshsingh@ipasautomation.com",
    password: process.env.ADMIN1_PASSWORD,
    mobile_no: "",
  },
  {
    fullname: "shahbaz",
    email: "shahbaz@ipasautomation.com",
    password: process.env.ADMIN2_PASSWORD,
    mobile_no: "",
  },
  {
    fullname: "Deepak",
    email: "deepak@ipasautomation.com",
    password: process.env.ADMIN3_PASSWORD,
    mobile_no: "",
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const admin of admins) {
    const exists = await User.findOne({ email: admin.email });
    if (exists) {
      console.log("Already exists:", admin.email);
      continue;
    }
    await new User(admin).save();
    console.log("Created:", admin.email);
  }

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
