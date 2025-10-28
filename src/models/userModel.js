const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "",
    }, //cloundinary image url
    profilePicId: {
        type: String,
        default: "",
    }, //cloundinary Public id
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    token: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: Number,
        default: null,
    },
    otpExpiresAt: {
        type: Date,
        default: null,
    },
    address: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    zipCode: {
        type: String,
        default: "",
    }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;