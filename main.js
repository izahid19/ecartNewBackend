const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const userRouter = require('./src/routes/userRouter');
const productRouter = require('./src/routes/productRouter');
const cartRouter = require('./src/routes/cartRouter');
const orderRouter = require('./src/routes/orderRouter');
const cors = require('cors');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ekart-store.vercel.app"
    ],
    credentials: true,
  })
);

// Middlewares
app.use(express.json());

// Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// Server
app.listen(port, () => {
  connectDB();
  console.log(`✅ Server is listening on port ${port}`);
});
