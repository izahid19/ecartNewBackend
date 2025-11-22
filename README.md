# E-Commerce Kart Backend

A robust and scalable backend for the E-Commerce Kart application, built with Node.js, Express, and MongoDB. This API supports user authentication, product management, shopping cart functionality, order processing, and payment integration.

## Features

- **User Authentication**: Secure signup, login, and email verification using JWT and Brevo.
- **Product Management**: Browse, search, and filter products.
- **Shopping Cart**: Add, remove, and update items in the cart.
- **Order Processing**: Create and manage orders.
- **Payment Integration**: Secure payments via Razorpay.
- **Image Uploads**: Cloudinary integration for product images.
- **Caching**: Redis integration for performance optimization.
- **API Documentation**: Interactive API docs with Swagger and Redoc.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Caching**: Redis
- **Authentication**: JSON Web Tokens (JWT)
- **Payment Gateway**: Razorpay
- **Email Service**: Brevo (formerly Sendinblue)
- **File Storage**: Cloudinary

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Redis](https://redis.io/) (Local or Cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following variables:

   ```env
   # Server Configuration
   PORT=3000
   FRONTEND_URL=http://localhost:5173

   # Database
   MONGO_DB_URL=mongodb://localhost:27017/ecommerce

   # Redis
   REDIS_URL=redis://localhost:6379

   # JWT Authentication
   SECRET_KEY=your_jwt_secret_key

   # Cloudinary (Image Uploads)
   CLOUD_NAME=your_cloud_name
   API_KEY=your_api_key
   API_SECRET=your_api_secret

   # Razorpay (Payments)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_SECRET=your_razorpay_secret

   # Brevo (Email Service)
   BREVO_API_KEY=your_brevo_api_key
   FROM_EMAIL=no-reply@example.com
   FROM_NAME=E-Commerce Kart
   ```

### Running the Server

- **Development Mode** (with Nodemon)
  ```bash
  npm run dev
  ```

- **Production Mode**
  ```bash
  npm start
  ```

The server will start on `http://localhost:3000` (or your specified PORT).

## API Documentation

The API is fully documented using Swagger and Redoc.

- **Interactive Docs (Redoc)**: Visit `http://localhost:3000/api-doc` to view the beautiful, interactive API documentation.
- **Swagger JSON**: Available at `http://localhost:3000/api-doc/swagger.json`.

## Project Structure

```
src/
├── config/         # Configuration files (DB, Redis, Swagger, etc.)
├── controllers/    # Request handlers for each route
├── emailVerify/    # Email verification logic
├── middleware/     # Express middleware (Auth, Validation, etc.)
├── models/         # Mongoose schemas and models
├── routes/         # API route definitions
└── utils/          # Utility functions (Cloudinary, etc.)
```

## License

This project is licensed under the ISC License.
