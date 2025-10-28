const mongoose = require("mongoose")

const env = process.env

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_DB_URL);
        console.log("MongoDB connected successfully")
    } catch (error) {
        console.log("Mongoose connection error", error)
    }
}

module.exports = connectDB;