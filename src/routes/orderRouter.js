const express = require("express");
const { isAdmin, isAuthenticated } = require("../middleware/isAuthenticated");
const { createOrder, verifyPayment, getAllOrdersAdmin, getUserOrders, getMyOrder, getSalesData } = require("../controllers/orderController");

const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.post("/verify-payment", isAuthenticated, verifyPayment);
orderRouter.get('/myorder', isAuthenticated, getMyOrder)
orderRouter.get("/all",isAuthenticated,isAdmin,getAllOrdersAdmin); 
orderRouter.get('/user-order/:userId',isAuthenticated,isAdmin, getUserOrders);
orderRouter.get("/sales", isAuthenticated,isAdmin, getSalesData);

module.exports = orderRouter;