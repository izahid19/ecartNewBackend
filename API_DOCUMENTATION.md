# E-Commerce Kart API Documentation

**Version:** 1.0.0  
**Base URL (Production):** `https://ecartnewbackend-production.up.railway.app/api`  
**Base URL (Development):** `http://localhost:3000/api`

---

## Table of Contents

- [Authentication](#authentication)
- [User Endpoints](#user-endpoints)
  - [Register](#register)
  - [Verify Email](#verify-email)
  - [Resend Verification](#resend-verification)
  - [Login](#login)
  - [Logout](#logout)
  - [Forget Password](#forget-password)
  - [Verify OTP](#verify-otp)
  - [Resend OTP](#resend-otp)
  - [Change Password](#change-password)
  - [Get All Users (Admin)](#get-all-users-admin)
  - [Get User by ID](#get-user-by-id)
  - [Update User Profile](#update-user-profile)
- [Product Endpoints](#product-endpoints)
  - [Get All Products](#get-all-products)
  - [Add Product (Admin)](#add-product-admin)
  - [Update Product (Admin)](#update-product-admin)
  - [Delete Product (Admin)](#delete-product-admin)
- [Cart Endpoints](#cart-endpoints)
  - [Get Cart](#get-cart)
  - [Add to Cart](#add-to-cart)
  - [Update Cart Item](#update-cart-item)
  - [Remove from Cart](#remove-from-cart)
- [Order Endpoints](#order-endpoints)
  - [Create Order](#create-order)
  - [Verify Payment](#verify-payment)
  - [Get My Orders](#get-my-orders)
  - [Get All Orders (Admin)](#get-all-orders-admin)
  - [Get User Orders (Admin)](#get-user-orders-admin)
  - [Get Sales Data (Admin)](#get-sales-data-admin)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

---

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

The token is received upon successful login and should be stored securely on the client side.

### Authentication Flow

1. **Register** → Receive verification email
2. **Verify Email** → Account activated
3. **Login** → Receive JWT token
4. Use token for authenticated requests

---

## User Endpoints

### Register

Register a new user account.

**Endpoint:** `POST /user/register`

**Rate Limit:** 10 requests per minute per IP

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "isVerified": false
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### Verify Email

Verify user email with OTP sent during registration.

**Endpoint:** `POST /user/verify`

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### Resend Verification

Resend verification email to user.

**Endpoint:** `POST /user/reverify`

**Rate Limit:** 1 request per 3 minutes per email

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /user/login`

**Rate Limit:** 10 requests per minute per IP

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "avatar": {
      "url": "https://cloudinary.com/...",
      "public_id": "avatar_123"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Logout

Logout the current user.

**Endpoint:** `POST /user/logout`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Forget Password

Request password reset email.

**Endpoint:** `POST /user/forget-password`

**Rate Limit:** 10 requests per minute per IP

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User not found with this email"
}
```

---

### Verify OTP

Verify OTP for password reset.

**Endpoint:** `POST /user/verify-otp/:email`

**Rate Limit:** 1 request per 3 minutes per email

**URL Parameters:**
- `email` (string, required) - User's email address

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### Resend OTP

Resend OTP for password reset.

**Endpoint:** `POST /user/resend-otp/:email`

**Rate Limit:** 1 request per 3 minutes per email

**URL Parameters:**
- `email` (string, required) - User's email address

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

---

### Change Password

Change user password after OTP verification.

**Endpoint:** `POST /user/change-password/:email`

**URL Parameters:**
- `email` (string, required) - User's email address

**Request Body:**
```json
{
  "password": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Get All Users (Admin)

Get list of all users (Admin only).

**Endpoint:** `GET /user/all-users`

**Authentication:** Required (Admin role)

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "isVerified": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "admin",
      "isVerified": true,
      "createdAt": "2024-01-10T08:20:00Z"
    }
  ],
  "count": 2
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

### Get User by ID

Get user details by ID.

**Endpoint:** `GET /user/get-user/:userId`

**Authentication:** Required

**URL Parameters:**
- `userId` (string, required) - User's ID

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "avatar": {
      "url": "https://cloudinary.com/...",
      "public_id": "avatar_123"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### Update User Profile

Update user profile information.

**Endpoint:** `PUT /user/update-user/:userId`

**Authentication:** Required

**Content Type:** `multipart/form-data`

**URL Parameters:**
- `userId` (string, required) - User's ID

**Request Body (Form Data):**
- `name` (string, optional) - User's name
- `file` (file, optional) - Profile picture

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe Updated",
    "email": "john.doe@example.com",
    "avatar": {
      "url": "https://cloudinary.com/new-avatar",
      "public_id": "avatar_456"
    }
  }
}
```

---

## Product Endpoints

### Get All Products

Retrieve all available products.

**Endpoint:** `GET /product/all-products`

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "success": true,
  "products": [
    {
      "id": "64b1c2d3e4f5g6h7i8j9k0l1",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 2999,
      "stock": 50,
      "category": "Electronics",
      "images": [
        {
          "url": "https://cloudinary.com/product1-img1",
          "public_id": "product1_img1"
        },
        {
          "url": "https://cloudinary.com/product1-img2",
          "public_id": "product1_img2"
        }
      ],
      "createdAt": "2024-01-20T12:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Add Product (Admin)

Add a new product to the catalog (Admin only).

**Endpoint:** `POST /product/add`

**Authentication:** Required (Admin role)

**Content Type:** `multipart/form-data`

**Request Body (Form Data):**
- `name` (string, required) - Product name
- `description` (string, required) - Product description
- `price` (number, required) - Product price
- `stock` (number, required) - Available stock
- `category` (string, required) - Product category
- `files` (files, required) - Product images (multiple files)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "64b1c2d3e4f5g6h7i8j9k0l1",
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 2999,
    "stock": 50,
    "category": "Electronics",
    "images": [
      {
        "url": "https://cloudinary.com/product-img",
        "public_id": "product_123"
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "All fields are required"
}
```

---

### Update Product (Admin)

Update an existing product (Admin only).

**Endpoint:** `PUT /product/update/:productId`

**Authentication:** Required (Admin role)

**Content Type:** `multipart/form-data`

**URL Parameters:**
- `productId` (string, required) - Product's ID

**Request Body (Form Data):**
- `name` (string, optional) - Product name
- `description` (string, optional) - Product description
- `price` (number, optional) - Product price
- `stock` (number, optional) - Available stock
- `category` (string, optional) - Product category
- `files` (files, optional) - New product images

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": "64b1c2d3e4f5g6h7i8j9k0l1",
    "name": "Premium Wireless Headphones",
    "description": "Updated description",
    "price": 3499,
    "stock": 45,
    "category": "Electronics"
  }
}
```

---

### Delete Product (Admin)

Delete a product from the catalog (Admin only).

**Endpoint:** `DELETE /product/delete/:productId`

**Authentication:** Required (Admin role)

**URL Parameters:**
- `productId` (string, required) - Product's ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Cart Endpoints

### Get Cart

Get the authenticated user's cart.

**Endpoint:** `GET /cart`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "cart": {
    "id": "64c1d2e3f4g5h6i7j8k9l0m1",
    "user": "64a1b2c3d4e5f6g7h8i9j0k1",
    "items": [
      {
        "product": {
          "id": "64b1c2d3e4f5g6h7i8j9k0l1",
          "name": "Wireless Headphones",
          "price": 2999,
          "images": [
            {
              "url": "https://cloudinary.com/product-img"
            }
          ]
        },
        "quantity": 2,
        "subtotal": 5998
      }
    ],
    "totalItems": 2,
    "totalAmount": 5998
  }
}
```

---

### Add to Cart

Add an item to the cart.

**Endpoint:** `POST /cart/add`

**Authentication:** Required

**Request Body:**
```json
{
  "productId": "64b1c2d3e4f5g6h7i8j9k0l1",
  "quantity": 2
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "items": [
      {
        "product": "64b1c2d3e4f5g6h7i8j9k0l1",
        "quantity": 2
      }
    ]
  }
}
```

---

### Update Cart Item

Update quantity of an item in the cart.

**Endpoint:** `PUT /cart/update`

**Authentication:** Required

**Request Body:**
```json
{
  "productId": "64b1c2d3e4f5g6h7i8j9k0l1",
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "cart": {
    "items": [
      {
        "product": "64b1c2d3e4f5g6h7i8j9k0l1",
        "quantity": 3
      }
    ]
  }
}
```

---

### Remove from Cart

Remove an item from the cart.

**Endpoint:** `DELETE /cart/remove`

**Authentication:** Required

**Request Body:**
```json
{
  "productId": "64b1c2d3e4f5g6h7i8j9k0l1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

---

## Order Endpoints

### Create Order

Create a new order and initiate payment.

**Endpoint:** `POST /orders/create-order`

**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "product": "64b1c2d3e4f5g6h7i8j9k0l1",
      "quantity": 2,
      "price": 2999
    }
  ],
  "totalAmount": 5998,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "64d1e2f3g4h5i6j7k8l9m0n1",
    "orderId": "ORD-20240115-001",
    "user": "64a1b2c3d4e5f6g7h8i9j0k1",
    "items": [...],
    "totalAmount": 5998,
    "status": "pending",
    "createdAt": "2024-01-15T14:30:00Z"
  },
  "razorpayOrder": {
    "id": "order_razorpay123",
    "amount": 599800,
    "currency": "INR"
  }
}
```

---

### Verify Payment

Verify payment after Razorpay payment completion.

**Endpoint:** `POST /orders/verify-payment`

**Authentication:** Required

**Request Body:**
```json
{
  "paymentId": "pay_razorpay123",
  "orderId": "order_razorpay123",
  "signature": "razorpay_signature_hash"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "id": "64d1e2f3g4h5i6j7k8l9m0n1",
    "status": "confirmed",
    "paymentStatus": "paid"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

---

### Get My Orders

Get all orders for the authenticated user.

**Endpoint:** `GET /orders/myorder`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "64d1e2f3g4h5i6j7k8l9m0n1",
      "orderId": "ORD-20240115-001",
      "items": [
        {
          "product": {
            "id": "64b1c2d3e4f5g6h7i8j9k0l1",
            "name": "Wireless Headphones",
            "images": [...]
          },
          "quantity": 2,
          "price": 2999
        }
      ],
      "totalAmount": 5998,
      "status": "confirmed",
      "paymentStatus": "paid",
      "createdAt": "2024-01-15T14:30:00Z",
      "deliveryDate": "2024-01-20T14:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Get All Orders (Admin)

Get all orders from all users (Admin only).

**Endpoint:** `GET /orders/all`

**Authentication:** Required (Admin role)

**Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "64d1e2f3g4h5i6j7k8l9m0n1",
      "orderId": "ORD-20240115-001",
      "user": {
        "id": "64a1b2c3d4e5f6g7h8i9j0k1",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "totalAmount": 5998,
      "status": "confirmed",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ],
  "count": 1,
  "totalRevenue": 5998
}
```

---

### Get User Orders (Admin)

Get all orders for a specific user (Admin only).

**Endpoint:** `GET /orders/user-order/:userId`

**Authentication:** Required (Admin role)

**URL Parameters:**
- `userId` (string, required) - User's ID

**Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "64d1e2f3g4h5i6j7k8l9m0n1",
      "orderId": "ORD-20240115-001",
      "totalAmount": 5998,
      "status": "confirmed",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Get Sales Data (Admin)

Get sales analytics and statistics (Admin only).

**Endpoint:** `GET /orders/sales`

**Authentication:** Required (Admin role)

**Response (200 OK):**
```json
{
  "success": true,
  "sales": {
    "totalOrders": 150,
    "totalRevenue": 450000,
    "todayOrders": 5,
    "todayRevenue": 15000,
    "monthlyRevenue": 125000,
    "topProducts": [
      {
        "product": {
          "id": "64b1c2d3e4f5g6h7i8j9k0l1",
          "name": "Wireless Headphones"
        },
        "totalSold": 45,
        "revenue": 134955
      }
    ],
    "recentOrders": [...]
  }
}
```

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

### IP-Based Rate Limiting
- **Limit:** 10 requests per minute per IP
- **Applies to:** `/user/register`, `/user/login`, `/user/forget-password`

### Email-Based Rate Limiting
- **Limit:** 1 request per 3 minutes per email
- **Applies to:** `/user/reverify`, `/user/verify-otp/:email`, `/user/resend-otp/:email`

When rate limit is exceeded, you'll receive a 429 status code:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 120
}
```

---

## Swagger Documentation

Interactive API documentation is available via Swagger UI:

**Production:** `https://ecartnewbackend-production.up.railway.app/api-docs`  
**Development:** `http://localhost:3000/api-docs`

---

## Support

For API support or questions, contact:
- **Email:** mushtaqzahid888@gmail.com
- **GitHub:** [Repository Link]

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- User authentication and management
- Product CRUD operations
- Cart management
- Order processing with Razorpay integration
- Admin dashboard features
- Rate limiting implementation
