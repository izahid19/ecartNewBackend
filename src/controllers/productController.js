const Product = require("../models/ProductModels");
const cloudinary = require("../utils/cloudinary");
const getDataUri = require("../utils/dataUri");

const addProduct = async (req, res) => {
  try {
    const { productName, productDesc, productPrice, category, brand } =
      req.body;
    const userId = req.id;

    // Validate required fields
    if (!productName || !productDesc || !productPrice || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Handle multiple image uploads
    let productImg = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri.content, {
          folder: "mern_products",
        });

        productImg.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // Create product in DB
    const newProduct = await Product.create({
      userId,
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      productImg, // array of objects {url, public_id}
    });

    return res.status(200).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    // Parse query params with defaults
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    // Enforce max limit = 30
    if (limit > 30) limit = 30;

    // Calculate how many products to skip
    const skip = (page - 1) * limit;

    // Fetch products (sorted newest first)
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Total count for pagination metadata
    const totalProducts = await Product.countDocuments();

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products available",
        products: [],
      });
    }

    // Send paginated data
    return res.status(200).json({
      success: true,
      currentPage: page,
      limitPerPage: limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary (correct field: productImg)
    if (product.productImg && product.productImg.length > 0) {
      for (let img of product.productImg) {
        if (img.public_id) {
          const result = await cloudinary.uploader.destroy(img.public_id);
          console.log("Cloudinary delete result:", result);
        }
      }
    }

    // Delete product from MongoDB
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { productName, productDesc, productPrice, category, brand, existingImages } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let updatedImages = [];

    // ✅ Keep selected old images
    if (existingImages) {
      const keepIds = JSON.parse(existingImages);
      updatedImages = product.productImg.filter((img) =>
        keepIds.includes(img.public_id)
      );

      // delete only removed images
      const removedImages = product.productImg.filter(
        (img) => !keepIds.includes(img.public_id)
      );
      for (let img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    } else {
      updatedImages = product.productImg; // keep all if nothing sent
    }

    // ✅ Upload new images if any
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri.content, { folder: "mern_products" });
        updatedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // ✅ Update product
    product.productName = productName || product.productName;
    product.productDesc = productDesc || product.productDesc;
    product.productPrice = productPrice || product.productPrice;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.productImg = updatedImages;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addProduct, getAllProduct, deleteProduct, updateProduct };
