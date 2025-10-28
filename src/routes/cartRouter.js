const express = require("express");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { addToCart, getCart, removeFromCart, updateQuantity } = require("../controllers/cartController");

const cartRouter = express.Router();

cartRouter.post("/add", isAuthenticated, addToCart);
cartRouter.get("/", isAuthenticated, getCart);
cartRouter.delete("/remove", isAuthenticated, removeFromCart);
cartRouter.put("/update", isAuthenticated, updateQuantity);

module.exports = cartRouter;