const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyEmail } = require("../emailVerify/verifyEmail");
const Session = require("../models/sessionModel");
const { verifyOtp } = require("../emailVerify/sendOTPMAIL");
const cloudinary = require("../utils/cloudinary");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    })
    verifyEmail(token, email) // sending email to verify user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password : hashedPassword,
    });
    newUser.token = token
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verify = async (req, res ) => {
    try {
      const authHeader = req.headers.authorization;
      if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(400).json({
          success: false,
          message: "Authorization token is required"
        })
      }
      const token = authHeader.split(" ")[1];
      let decoded
      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY)
      } catch (error) {
        if(error.name === "TokenExpiredError"){
          return res.status(400).json({
            success: false,
            message: "Token expired"
          })
        }
        return res.status(400).json({
          success: false,
          message: "Token verification failed"
        })
      }
      const user = await User.findOne({email: decoded.email})
      if(!user){
        return res.status(400).json({
          success: false,
          message: "User not found"
        })
      }
      user.token = null;
      user.isVerified = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User verified successfully"
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
}

const reVerify = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    })
    verifyEmail(token, email) // sending email to verify user
    user.token = token
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if(!email || !password){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if(!isPasswordMatch){
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      })
    }
    if(user.isVerified === false){
      return res.status(400).json({
        success: false,
        message: "User not verified"
      })
    }

    const accessToken = jwt.sign({id: user._id}, process.env.SECRET_KEY, {expiresIn: "10d"})
    const refreshToken = jwt.sign({id: user._id}, process.env.SECRET_KEY, {expiresIn: "30d"})
    
    user.isLoggedIn = true;
    await user.save()

    const existingSession = await Session.findOne({userId: user._id})
    if(existingSession){
      await Session.deleteOne({userId: user._id})
    }

    await Session.create({
      userId: user._id
    })

    const filteredUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: filteredUser,
      accessToken,
      refreshToken
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })    
  }
}

const logout = async (req, res) => {
  try {
    const userId = req.id;
    await Session.deleteMany({userId: userId});
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res.status(200).json({
      success: true,
      message: "User logged out successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    user.otp = otp
    user.otpExpiresAt = otpExpire
    await user.save()
    await verifyOtp(otp, email)
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const verifyUserOtp = async (req, res) => {
  try {
    const { otp } = req.body
    const email = req.params.email
    if(!otp){
      return res.status(400).json({
        success: false,
        message: "OTP is required"
      })
    }

    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    if(!user.otp || !user.otpExpiresAt){
      return res.status(400).json({
        success: false,
        message: "OTP not found"
      })
    }
    if(user.otpExpiresAt < Date.now()){
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      })
    }
    if(otp != user.otp){
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      })
    }
    user.otp = null
    user.otpExpiresAt = null
    await user.save()
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    })  
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const resendUserOtp = async (req, res) => {
  try {
    const email = req.params.email
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    user.otp = otp
    user.otpExpiresAt = otpExpire
    await user.save()
    await verifyOtp(otp, email)
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const changePassword = async (req, res) => {
  try {
    const { newPassword , confirmPassword } = req.body
    const {email} = req.params
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    if(!newPassword || !confirmPassword){
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required"
      })
    }
    if(newPassword !== confirmPassword){
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()
    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const user = await User.find()
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: user
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId).select("-password -otp -otpExpiresAt -token -__v")
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.userId
    const loggedInUser = req.user // from middleware
    const { firstName, lastName, email, address, city, zipCode , phoneNo, role } = req.body
    if(loggedInUser._id.toString() !== userIdToUpdate){
      return res.status(400).json({
        success: false,
        message: "You are not authorized to update the profile"
      })
    }

    let user = await User.findById(userIdToUpdate)
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }

    let profilePic = user.profilePic
    let profilePicId = user.profilePicId
    if(req.file){
      if(profilePicId){
        await cloudinary.uploader.destroy(profilePicId)
      }
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
          folder: "profilePics"},
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
          )
          stream.end(req.file.buffer);
      })
      profilePic = uploadResult.secure_url
      profilePicId = uploadResult.public_id
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.address = address || user.address;
    user.city = city || user.city;
    user.zipCode = zipCode || user.zipCode;
    user.phoneNo = phoneNo || user.phoneNo;
    user.role = role || user.role;
    user.profilePic = profilePic
    user.profilePicId = profilePicId
    const updatedUser = await user.save()
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = { 
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
};
