const express = require("express");
const { 
  register, verify, reVerify, login, logout,
  forgetPassword, verifyUserOtp, resendUserOtp,
  changePassword, getAllUsers, getUserById, updateUser
} = require("../controllers/userController");

const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const { singleUpload } = require("../middleware/multer");
const { createRateLimiter } = require("../middleware/rateLimiter");

const userRouter = express.Router();

/* ---------------------------------------------
   🚦 Rate Limiters
--------------------------------------------- */

// Per-IP limiter (10 requests per minute)
const ipLimiter = createRateLimiter({
  windowSeconds: 60, // 1 minute
  max: 10,
  keyPrefix: "rl:ip:",
  getKey: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

// Per-email limiter (1 request per 3 minutes)
const emailLimiter = createRateLimiter({
  windowSeconds: 60 * 3, // 3 minutes
  max: 1,
  keyPrefix: "rl:email:",
  getKey: (req) => (req.body?.email || req.params?.email || "").toLowerCase(),
});

/* ---------------------------------------------
   🧩 Routes
--------------------------------------------- */

// Auth-related routes with IP-based limiting
userRouter.post("/register", ipLimiter, register);
userRouter.post("/verify", verify);
userRouter.post("/reverify", emailLimiter, reVerify);
userRouter.post("/login", ipLimiter, login);
userRouter.post("/logout", isAuthenticated, logout);

// Password-related routes with IP-based limiting
userRouter.post("/forget-password", ipLimiter, forgetPassword);
userRouter.post("/verify-otp/:email", emailLimiter, verifyUserOtp);
userRouter.post("/resend-otp/:email", emailLimiter, resendUserOtp);
userRouter.post("/change-password/:email", changePassword);

// Admin and user profile routes
userRouter.get("/all-users", isAuthenticated, isAdmin, getAllUsers);
userRouter.get("/get-user/:userId", isAuthenticated, getUserById);
userRouter.put("/update-user/:userId", isAuthenticated, singleUpload, updateUser);

module.exports = userRouter;
