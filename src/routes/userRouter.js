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

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         role:
 *           type: string
 *           description: The user's role (user/admin)
 *           default: user
 */

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

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
userRouter.post("/register", ipLimiter, register);
/**
 * @swagger
 * /user/verify:
 *   post:
 *     summary: Verify user email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP
 */
userRouter.post("/verify", verify);
/**
 * @swagger
 * /user/reverify:
 *   post:
 *     summary: Resend verification email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Invalid email
 */
userRouter.post("/reverify", emailLimiter, reVerify);
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
userRouter.post("/login", ipLimiter, login);
/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
userRouter.post("/logout", isAuthenticated, logout);

// Password-related routes with IP-based limiting

/**
 * @swagger
 * /user/forget-password:
 *   post:
 *     summary: Request password reset
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
userRouter.post("/forget-password", ipLimiter, forgetPassword);
/**
 * @swagger
 * /user/verify-otp/{email}:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid OTP
 */
userRouter.post("/verify-otp/:email", emailLimiter, verifyUserOtp);
/**
 * @swagger
 * /user/resend-otp/{email}:
 *   post:
 *     summary: Resend OTP for password reset
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email
 *     responses:
 *       200:
 *         description: OTP resent
 */
userRouter.post("/resend-otp/:email", emailLimiter, resendUserOtp);
/**
 * @swagger
 * /user/change-password/{email}:
 *   post:
 *     summary: Change password
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
userRouter.post("/change-password/:email", changePassword);

// Admin and user profile routes

/**
 * @swagger
 * /user/all-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Access denied
 */
userRouter.get("/all-users", isAuthenticated, isAdmin, getAllUsers);
/**
 * @swagger
 * /user/get-user/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
userRouter.get("/get-user/:userId", isAuthenticated, getUserById);
/**
 * @swagger
 * /user/update-user/{userId}:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 */
userRouter.put("/update-user/:userId", isAuthenticated, singleUpload, updateUser);

module.exports = userRouter;
