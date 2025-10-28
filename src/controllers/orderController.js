const crypto = require("crypto");
const razorpayInstance = require("../config/razorpay");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModels");
const Product = require("../models/ProductModels");

// ------------------------------
// Create Razorpay Order
// ------------------------------
const createOrder = async (req, res) => {
  try {
    const { products, amount, tax, shipping, currency, shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    // ✅ Amount expected in rupees from frontend
    const amountInPaise = Math.round(Number(amount) * 100);

    // Step 1: Create Razorpay order
    const options = {
      amount: amountInPaise, // Razorpay expects paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Step 2: Save order in DB
    const newOrder = new Order({
      user: req.user._id,
      products,
      amount,
      tax,
      shipping,
      currency,
      shippingAddress,
      status: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    await newOrder.save();

    res.json({
      success: true,
      message: "Order created successfully",
      order: razorpayOrder,
      dbOrder: newOrder,
    });
  } catch (error) {
    console.error("❌ Error in createOrder:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// Verify Payment
// ------------------------------
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentFailed } = req.body;
    const userId = req.user._id;

    if (paymentFailed) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "Failed" },
        { new: true }
      );
      return res.status(400).json({ success: false, message: "Payment failed", order });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: "Paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
        { new: true }
      );

      // Clear user cart
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [], totalPrice: 0 } });

      return res.json({ success: true, message: "Payment verified successfully", order });
    } else {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "Failed" },
        { new: true }
      );
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("❌ Error in verifyPayment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// Get All Orders (Admin)
// ------------------------------
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email")
      .populate("products.productId", "productName productPrice productImg");

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("❌ Error in getAllOrdersAdmin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// Get Orders by User ID (Admin)
// ------------------------------
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId })
      .populate("products.productId", "productName productPrice productImg")
      .populate("user", "firstName lastName email");

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// Get My Orders (via token)
// ------------------------------
const getMyOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 30 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate("products.productId", "productName productPrice productImg")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages,
      page: Number(page),
      orders,
    });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// Sales Analytics (Admin Dashboard)
// ------------------------------
const getSalesData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({ status: "Paid" });

    const totalSalesAgg = await Order.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDate = await Order.aggregate([
      { $match: { status: "Paid", createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
      sales: salesByDate.map(item => ({ date: item._id, amount: item.amount })),
    });
  } catch (error) {
    console.error("❌ Error fetching sales data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getAllOrdersAdmin,
  getUserOrders,
  getMyOrder,
  getSalesData,
};
