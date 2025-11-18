import rateLimit from "express-rate-limit";

export const outpassLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    code: "RATE_LIMIT",
    message: "Too many outpass attempts, please try again later."
  }
});

