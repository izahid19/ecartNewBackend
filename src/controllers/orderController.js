const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModels");
const Product = require("../models/ProductModels");

// ------------------------------
// Place Order (Direct - No Payment Gateway)
// ------------------------------
const placeOrder = async (req, res) => {
  try {
    const { products, amount, tax, shipping, currency, shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.fullName) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products in order" });
    }

    // Create order directly
    const newOrder = new Order({
      user: req.user._id,
      products,
      amount,
      tax,
      shipping,
      currency: currency || "INR",
      shippingAddress,
      status: "Paid", // Directly mark as paid
    });

    await newOrder.save();

    // Clear user cart
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [], totalPrice: 0 } }
    );

    res.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error in placeOrder:", error);
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
  placeOrder,
  getAllOrdersAdmin,
  getUserOrders,
  getMyOrder,
  getSalesData,
};
