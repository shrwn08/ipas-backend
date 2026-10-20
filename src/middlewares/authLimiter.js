import rateLimit from "express-rate-limit";

const build = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const authLimiter = build(
  15 * 60 * 1000,
  20,
  "Too many attempts. Wait a few minutes and try again",
);


export const enquiryLimiter = build(
60 * 60 * 1000,
5,
"Too many messages sent. Please try again later."
);


