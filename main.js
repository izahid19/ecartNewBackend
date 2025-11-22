const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const userRouter = require('./src/routes/userRouter');
const productRouter = require('./src/routes/productRouter');
const cartRouter = require('./src/routes/cartRouter');
const orderRouter = require('./src/routes/orderRouter');
const cors = require('cors');
const redoc = require('redoc-express');
const swaggerSpec = require('./src/config/swagger');

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

app.get('/api-doc/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get(
  '/api-doc',
  redoc({
    title: 'API Docs',
    specUrl: '/api-doc/swagger.json',
    nonce: '', // <= it is optional,we can omit this key and value
    // we are now start supporting the redocOptions object
    // you can omit the options object if you don't need it
    // https://redocly.com/docs/api-reference-docs/configuration/functionality/
    redocOptions: {
      hideDownloadButton: true,
      theme: {
        colors: {
          primary: {
            main: '#6EC5AB'
          }
        },
        typography: {
          fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
          fontSize: '15px',
          lineHeight: '1.5',
          code: {
            code: '#87939d',
            backgroundColor: '#4d4d4e'
          }
        },
        menu: {
          backgroundColor: '#ffffff'
        }
      }
    }
  })
);

// Server
app.listen(port, () => {
  connectDB();
  console.log(`✅ Server is listening on port ${port}`);
});
