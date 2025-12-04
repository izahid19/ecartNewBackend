const express = require("express");
const { isAdmin, isAuthenticated } = require("../middleware/isAuthenticated");
const { placeOrder, getAllOrdersAdmin, getUserOrders, getMyOrder, getSalesData } = require("../controllers/orderController");

const orderRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user:
 *           type: string
 *         items:
 *           type: array
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 */


/**
 * @swagger
 * /orders/place-order:
 *   post:
 *     summary: Place a new order directly
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - amount
 *             properties:
 *               products:
 *                 type: array
 *               amount:
 *                 type: number
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
orderRouter.post("/place-order", isAuthenticated, placeOrder);

/**
 * @swagger
 * /orders/myorder:
 *   get:
 *     summary: Get my orders
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my orders
 */
orderRouter.get('/myorder', isAuthenticated, getMyOrder)

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
orderRouter.get("/all", isAuthenticated, isAdmin, getAllOrdersAdmin); 

/**
 * @swagger
 * /orders/user-order/{userId}:
 *   get:
 *     summary: Get user orders (Admin only)
 *     tags: [Order]
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
 *         description: List of user orders
 */
orderRouter.get('/user-order/:userId', isAuthenticated, isAdmin, getUserOrders);

/**
 * @swagger
 * /orders/sales:
 *   get:
 *     summary: Get sales data (Admin only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales data
 */
orderRouter.get("/sales", isAuthenticated, isAdmin, getSalesData);


module.exports = orderRouter;