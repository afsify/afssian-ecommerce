const express = require("express");
const user_route = express.Router();
const config=require("../config/config");
const { userSession, loginSession } = require("../middleware/auth");
const userController = require("../controllers/user/userController");
const cartController = require("../controllers/user/cartController");
const accountController = require("../controllers/user/accountController");
const wishlistController = require("../controllers/user/wishlistController");
const checkoutController = require("../controllers/user/checkoutController");
const purchaseController = require("../controllers/user/purchaseController");

//? ============================================== Landing Home ==============================================

user_route.get("/", userController.viewHome);

//? ============================================== SignIn SignUp ==============================================

user_route.get("/login", loginSession, userController.viewSignIn);
user_route.post("/login", userController.verifySignIn);
user_route.get("/signup", loginSession, userController.viewSignUp);
user_route.post("/otp", userController.sendOtp);
user_route.post("/verifyotp", loginSession, userController.verifyOtp);

//? ============================================== Shop Product ==============================================

user_route.get("/shop", userController.viewShop);
user_route.get("/productdetials/:id/:val", userController.productDetail);

//? ============================================ Account Settings ============================================

user_route.get("/account", userSession, accountController.viewAccount);
user_route.post('/update-profile', userSession, accountController.updateProfile);
user_route.get('/change-password', userSession, accountController.viewChangePassword);
user_route.post('/update-password', userSession, accountController.updatePassword);
user_route.get("/address", userSession, accountController.viewAddress);
user_route.post("/addaddress", userSession, accountController.createAddress);
user_route.post("/deleteaddress/:id", userSession, accountController.deleteAddress);
user_route.get("/discount", userSession, accountController.viewDiscount);

//? ============================================ Wishlist Product ============================================

user_route.get("/wishlist", userSession, wishlistController.viewWishlist);
user_route.post("/add-to-wishlist/:id", userSession, wishlistController.addToWishlist);
user_route.post("/delete-wishlist", userSession, wishlistController.deleteWishlist);

//? ============================================ Order Product ============================================

user_route.get("/order", userSession, purchaseController.viewOrder);
user_route.get("/order-detail/:id", userSession, purchaseController.viewOrderDetail);
user_route.post("/cancelOrder",userSession,purchaseController.cancelOrder);
user_route.post("/return-order",userSession,purchaseController.returnOrder);

//? ============================================== Cart Product ==============================================

user_route.get("/cart", userSession, cartController.viewCart);
user_route.post("/add-to-cart/:id", userSession, cartController.addToCart);
user_route.post("/quantity-inc", userSession, cartController.quantityInc);
user_route.post("/quantity-dec", userSession, cartController.quantityDec);
user_route.post("/delete-cart", userSession, cartController.deleteCart);

//? ============================================= Checkout Order =============================================

user_route.get('/checkout-detail', userSession, checkoutController.viewCheckoutDetail);
user_route.post('/check-coupon', userSession, checkoutController.checkCoupon);
user_route.post('/select-address', userSession, checkoutController.selectAddress);
user_route.post('/submit-checkOut', userSession, checkoutController.submitCheckout);
user_route.post('/verifyPayment',userSession,checkoutController.verifyPayment)
user_route.get('/checkout-review', userSession, checkoutController.viewCheckoutReview);

//? =============================================== Logout User ===============================================

user_route.get("/userlogout", userController.logoutUser);

module.exports = user_route;