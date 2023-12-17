const userModel = require("../../models/userModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");

//! ============================================== Order History ==============================================

const viewOrder = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    let cart = await userModel
      .findOne({ _id: userId })
      .populate("cart.product_id");
    const id = res.locals.userdata;
    let userData = await userModel.findOne({ _id: id });
    const orderDetails = await orderModel
      .find({ user_Id: req.session.user._id })
      .sort({ date: -1 })
      .populate("products.product");
    res.render("user/userOrder", {
      page: "order",
      cart,
      userData,
      orderDetails,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Order Detail ==============================================

const viewOrderDetail = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    let cart = await userModel
      .findOne({ _id: userId })
      .populate("cart.product_id");
    const id = req.params.id;
    let userData = await userModel.findOne({ _id: userId });
    const orderData = await orderModel
      .findOne({ _id: id })
      .populate("products.product");
    res.render("user/order-detail", {
      page: "order-detail",
      cart,
      userData,
      orderData,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Cancel Order ==============================================

const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const orderId = req.body.orderId;
    const orderCheck = await orderModel.findOne({ _id: orderId });
    if (orderCheck.paymentStatus == "Paid") {
      const userData = await orderModel.findOne({ _id: orderId });
      const cusId = userData.user_Id;
      const user = await userModel.findOne({ _id: cusId });
      let walletData = await userModel.updateOne(
        { _id: cusId },
        { $inc: { wallet: userData.Subtotal } }
      );
      const orderData = await orderModel.updateOne(
        { _id: orderId },
        { $set: { paymentStatus: "Refunded" } }
      );
      const reOrderStock = await orderModel.findOne({ _id: orderId });
      reOrderStock.products.forEach(async (items, i) => {
        let orderQty = items.quantity;
        let orderProduct = await productModel.updateOne(
          { _id: items.product },
          { $inc: { stock: orderQty } }
        );
      });
      const order = await orderModel.updateOne(
        { _id: orderId },
        { $set: { orderStatus: "Canceled" } }
      );
      res.send({ success: true });
    } else {
      const reOrderStock = await orderModel.findOne({ _id: orderId });
      reOrderStock.products.forEach(async (items, i) => {
        let orderQty = items.quantity;
        let orderProduct = await productModel.updateOne(
          { _id: items.product },
          { $inc: { stock: orderQty } }
        );
      });
      const order = await orderModel.updateOne(
        { _id: orderId },
        { $set: { orderStatus: "Canceled" } }
      );
      res.send({ success: true });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================== Return Order ==============================================

const returnOrder = async (req, res) => {
  try {
    const id = req.session.user._id;
    const orderId = req.body.orderId;
    const reason = req.body.reason;
    const reOrder = await orderModel
      .findOneAndUpdate(
        { user_Id: id, _id: orderId },
        { $set: { orderStatus: "Return Request", returnReason: reason } },
        { new: true }
      )
      .then(() => {
        res.redirect("/order");
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewOrder,
  viewOrderDetail,
  cancelOrder,
  returnOrder,
};
