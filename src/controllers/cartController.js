const Cart = require("../models/cartModels");
const Product = require("../models/ProductModels");

const getCart = async (req, res) => {
    try {
        const userId = req.id;

        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart) {
            return res.json({ success: true, cart: [] });
        }
        res.status(200).json({ success: true, cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 🟢 Add product to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.id;
        const { productId } = req.body;

        // 1️⃣ Check if product exists
        const product = await Product.findById(productId);
        if (!product)
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });

        // 2️⃣ Find the user's cart (if exists)
        let cart = await Cart.findOne({ userId });

        // 3️⃣ If cart doesn’t exist, create a new one
        if (!cart) {
            cart = new Cart({
                userId,
                items: [{ productId, quantity: 1, price: product.productPrice }],
                totalPrice: product.productPrice,
            });
        } else {
            // 4️⃣ Find if product is already in the cart
            const itemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === productId
            );

            if (itemIndex > -1) {
                // If product exists → just increase quantity
                cart.items[itemIndex].quantity += 1;
            } else {
                // If new product → push to cart
                cart.items.push({
                    productId,
                    quantity: 1,
                    price: product.productPrice,
                });
            }

            // 5️⃣ Recalculate total price
            cart.totalPrice = cart.items.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );
        }

        // 6️⃣ Save updated cart
        await cart.save();

        // 7️⃣ Populate product details before sending response
        const populatedCart = await Cart.findById(cart._id).populate(
            "items.productId"
        );

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart: populatedCart,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// 🟢 Update quantity
const updateQuantity = async (req, res) => {
    try {
        const userId = req.id;
        const { productId, type } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        console.log("Requested productId:", productId);
        console.log("Cart items productIds:", cart.items.map(i => i.productId.toString()));

        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        if (type === "increase") item.quantity += 1;
        if (type === "decrease" && item.quantity > 1) item.quantity -= 1;

        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        await cart.save();
        cart = await cart.populate("items.productId");

        res.status(200).json({ success: true, cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// 🟢 Remove product
const removeFromCart = async (req, res) => {
    try {
        const userId = req.id;
        const { productId } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // ✅ Re-populate productId before sending
        cart = await cart.populate("items.productId");

        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = { getCart, addToCart, updateQuantity, removeFromCart };