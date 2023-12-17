const Razorpay = require("razorpay");
const userModel = require("../../models/userModel");
const orderModel = require("../../models/orderModel");
const couponModel = require("../../models/couponModel");
const productModel = require("../../models/productModel");

//! ============================================= Checkout Detail =============================================

const viewCheckoutDetail = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    let cartBill = await userModel.findOne({ _id: res.locals.userdata._id });
    let coupon = await couponModel.find();
    let cart = await userModel.findOne({ _id: id }).populate("cart.product_id");
    res.render("user/checkoutDetail", {
      page: "checkout",
      cart,
      cartBill,
      coupon,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Select Address ==============================================

const selectAddress = async (req, res, next) => {
  try {
    const id = res.locals.userdata._id;
    const addressId = req.body.id;
    let userAddress = await userModel.findOne({ _id: id });
    userAddress.address.forEach((val) => {
      if (val._id.toString() == addressId.toString()) {
        res.json(val);
      }
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Check Coupon ==============================================

const checkCoupon = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const total = parseInt(req.body.total);
    const checkCoupon = await couponModel.findOne({
      couponCode: req.body.code,
    });
    const couponStatus = await couponModel.findOne({
      couponCode: req.body.code,
      status: "Active",
    });
    const usedCoupon = await orderModel.findOne({
      user_Id: userId,
      "coupon.couponCode": req.body.code,
    });
    if (checkCoupon) {
      if (couponStatus) {
        if (!usedCoupon) {
          const couponExp = checkCoupon.expiryDate;
          const date = new Date();
          if (couponExp > date) {
            if (checkCoupon && checkCoupon.minimumAmount <= total) {
              req.session.coupon = checkCoupon.couponCode;
              req.session.discount = checkCoupon.discountAmount;

              const amount = checkCoupon.discountAmount;
              var cartTotal = total - amount;

              res.json({ status: true, total: cartTotal, amount });
            } else {
              res.json({
                status: false,
                message: "Coupon code is not matching",
              });
            }
          } else {
            await couponModel.updateOne(
              { couponCode: req.body.code },
              { $set: { status: "Expired" } }
            );
            res.json({ status: false, message: "Coupon code is not matching" });
          }
        } else {
          res.json({ status: false, message: "Coupon code is not matching" });
        }
      } else {
        res.json({ status: false, message: "Coupon code is not matching" });
      }
    } else {
      res.json({ status: false, message: "Coupon code is not matching" });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================== Place Order ==============================================

const submitCheckout = async (req, res, next) => {
  try {
    const id = res.locals.userdata._id;
    const name = req.body.name;
    const phone = req.body.phone;
    const house = req.body.house;
    const post = req.body.post;
    const pin = req.body.pin;
    const city = req.body.city;
    const district = req.body.district;
    const state = req.body.state;
    const payment = req.body.payment;
    const totalPrice = parseInt(req.body.totalPrice);
    const cartData = await userModel
      .findOne({ _id: id })
      .populate("cart.product_id");
    const orderSubTotal = totalPrice;
    const productsData = cartData.cart.map((item) => ({
      product: item.product_id._id,
      quantity: item.quantity,
      price: item.product_id.price,
    }));
    const orderData = await orderModel({
      user_Id: id,
      products: productsData,
      Subtotal: orderSubTotal,
      address: {
        name: name,
        phone: phone,
        house: house,
        post: post,
        pin: pin,
        city: city,
        district: district,
        state: state,
      },
      coupon: {
        couponCode: req.session.coupon,
        couponDiscount: req.session.discount,
      },
      orderStatus: "Placed",
    });
    await orderData.save();
    req.session.coupon = "";
    req.session.discount = "";
    const OrderId = await orderModel.findOne({}).sort({ date: -1 }).limit(1);
    req.session.OrderId = OrderId._id;
    if (payment == "COD") {
      await orderModel.updateOne(
        { _id: OrderId._id },
        { $set: { paymentMethod: "COD" } }
      );
      const userData = await userModel.findById(res.locals.userdata._id);
      const cartProducts = userData.cart;
      for (let i = 0; i < cartProducts.length; i++) {
        let singleProduct = await productModel.findById(
          cartProducts[i].product_id
        );
        singleProduct.stock -= cartProducts[i].quantity;
        if (singleProduct.stock <= 0) {
          singleProduct.status = "Out of Stock";
        }
        singleProduct.save();
      }
      const userCart = await userModel.updateOne(
        { _id: id },
        { $unset: { cart: { $exists: true } } }
      );
      res.send({ codsuccess: true, cod: true });
    } else if (payment == "onlinePayment") {
      var instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });
      var options = {
        amount: orderSubTotal * 100,
        currency: "INR",
        receipt: "" + OrderId._id,
      };
      instance.orders.create(options, function (err, orders) {
        if (err) {
          console.log("error");
        } else {
          res.json({ success: true, order: orders });
        }
      });
    } else {
      await orderModel.updateOne(
        { _id: OrderId._id },
        { $set: { paymentStatus: "Paid", paymentMethod: "Wallet" } }
      );
      await userModel.updateOne(
        { _id: res.locals.userdata._id },
        { $inc: { wallet: -orderSubTotal } }
      );
      const userData = await userModel.findById(res.locals.userdata._id);
      const cartProducts = userData.cart;
      for (let i = 0; i < cartProducts.length; i++) {
        let singleProduct = await productModel.findById(
          cartProducts[i].product_id
        );
        singleProduct.stock -= cartProducts[i].quantity;
        if (singleProduct.stock <= 0) {
          singleProduct.status = "Out of Stock";
        }
        singleProduct.save();
      }
      const userCart = await userModel.updateOne(
        { _id: id },
        { $unset: { cart: { $exists: true } } }
      );
      res.send({ codsuccess: true, cod: true });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================== Verify Payment ==============================================

const verifyPayment = async (req, res, next) => {
  try {
    const id = req.session.user._id;
    await orderModel
      .updateOne(
        { _id: req.session.OrderId, user_Id: req.session.user._id },
        { $set: { paymentStatus: "Paid", paymentMethod: "Online Payment" } }
      )
      .then((data) => {
        res.json({ success: true });
      });
    const userData = await userModel.findById(res.locals.userdata._id);
    const cartProducts = userData.cart;
    for (let i = 0; i < cartProducts.length; i++) {
      let singleProduct = await productModel.findById(
        cartProducts[i].product_id
      );
      singleProduct.stock -= cartProducts[i].quantity;
      if (singleProduct.stock <= 0) {
        singleProduct.status = "Out of Stock";
      }
      singleProduct.save();
    }
    const userCart = await userModel.updateOne(
      { _id: id },
      { $unset: { cart: { $exists: true } } }
    );
    req.session.OrderId = "";
  } catch (error) {
    next(error);
  }
};

//! ============================================ Checkout Review ============================================

const viewCheckoutReview = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    let cart = await userModel
      .findOne({ _id: userId })
      .populate("cart.product_id");
    const orderData = await orderModel
      .findOne({ user_Id: userId })
      .sort({ date: -1 })
      .limit(1)
      .populate("products.product");
    res.render("user/checkoutReview", {
      page: "review",
      cart,
      orderData,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewCheckoutDetail,
  selectAddress,
  checkCoupon,
  submitCheckout,
  verifyPayment,
  viewCheckoutReview,
};
