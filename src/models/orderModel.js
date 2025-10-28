const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      },
    ],

    amount: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },

    // ✅ Store delivery address snapshot (so it's saved even if user later changes profile)
    shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String, default: "India" },
  },

    // Razorpay fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
