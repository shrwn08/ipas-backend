export const notFound = (_, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)[0]?.message || err.message;
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid value from ${err.path}.`;
  } else if (err.code === 11000) {
    status = 409;
    if (err.keyPattern?.email)
      message = "An account with this email already exists.";
    else if (err.keyPattern?.name)
      message = "This company is already listed under that industry.";
    else message = "That record already exists.";
  }

  if (status >= 500) {
    console.error(err);
    message = "Server error";
  }

  res.status(status).json({ success: false, message });
};
