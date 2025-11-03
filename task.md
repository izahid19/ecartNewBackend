# auth api

Post method:  /api/user/register
Post method:  /api/user/verify
Post method:  /api/user/reverify
Post method:  /api/user/login
Post method:  /api/user/logout

# Password-related routes with IP-based limiting

Post method:  /api/user/forget-password
Post method:  /api/user/verify-otp/:email
Post method:  /api/user/resend-otp/:email
Post method:  /api/user/change-password/:email

# Admin and user profile routes

get method:  /api/user/all-users
get method:  /api/user/get-user/:userId
put method:  /api/user/update-user/:userId

# Product API

get method:  /api/product/all-products
post method:  /api/product/add
put method:  /api/product/update/:productId
delete method:  /api/product/delete/:productId

# cart API 

get method:  /api/cart
post method:  /api/cart/add
put method:  /api/cart/update
delete method:  /api/cart/remove

# Order API for User and Admin

# for user
get method:  /api/orders/myorder  
post method:  /api/orders/create-order
post method:  /api/orders/verify-payment

# admin 
get method:  /api/orders/all           
get method:  /api/orders/user-order/:userId
get method:  /api/orders/sales
