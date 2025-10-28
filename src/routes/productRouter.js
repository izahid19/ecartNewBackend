const express = require("express");
const { addProduct, getAllProduct, deleteProduct, updateProduct } = require("../controllers/productController");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const { multipleUpload } = require("../middleware/multer");

const productRouter = express.Router();

productRouter.post("/add", isAuthenticated, isAdmin, multipleUpload, addProduct);
productRouter.get("/all-products", getAllProduct);
productRouter.delete("/delete/:productId", isAuthenticated, isAdmin, deleteProduct);
productRouter.put("/update/:productId", isAuthenticated, isAdmin, multipleUpload, updateProduct);

module.exports = productRouter;