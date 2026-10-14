import User from "../models/user.models.js";

export const register = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const isEmailRegistered = await User.findOne({ email });

    if (isEmailRegistered)
      res
        .status(409)
        .json({ message: "Email is already existing", success: false });

    const user = new User({ fullname, email, password });

    await user.save();

    res.status(201).json({ success: true, message: "User is created" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError =
        Object.values(error.errors)[0]?.message || error.message;
      return res.status(400).json({ success: false, message: firstError });
    }

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered" });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
