const express = require("express");
const { 
    register, 
    verify, 
    reVerify, 
    login, 
    logout, 
    forgetPassword, 
    verifyUserOtp,
    resendUserOtp, 
    changePassword,
    getAllUsers,
    getUserById,
    updateUser
} = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const  { singleUpload } = require("../middleware/multer");

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/verify", verify);
userRouter.post("/reverify", reVerify);
userRouter.post("/login", login);
userRouter.post("/logout", isAuthenticated, logout);
userRouter.post("/forget-password", forgetPassword);
userRouter.post("/verify-otp/:email", verifyUserOtp);
userRouter.post("/resend-otp/:email", resendUserOtp);
userRouter.post("/change-password/:email", changePassword);
userRouter.get("/all-users", isAuthenticated, isAdmin, getAllUsers);
userRouter.get("/get-user/:userId", isAuthenticated, getUserById);
userRouter.put("/update-user/:userId", isAuthenticated, singleUpload, updateUser);



module.exports = userRouter;