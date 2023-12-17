const userModel = require("../../models/userModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");

//! =============================================== Orders List ===============================================

const viewOrderManage = async (req, res, next) => {
  try {
    const OrderData = await orderModel
      .find({})
      .sort({ date: -1 })
      .populate("products.product");
    const OrderCount = await orderModel
      .find({})
      .populate("products.product")
      .count();
    res.render("admin/orderManage", {
      page: "order-manage",
      admin: res.locals.admindata.name,
      OrderData,
      OrderCount,
    });
  } catch (error) {
    next(error);
  }
};

//! =============================================== Order Data ===============================================

const viewOrderData = async (req, res, next) => {
  try {
    const id = req.params.id;
    const orderData = await orderModel
      .findOne({ _id: id })
      .populate("products.product");
    res.render("admin/order-data", {
      page: "order-data",
      orderData,
      admin: res.locals.admindata.name,
    });
  } catch (error) {
    next(error);
  }
};

//! =============================================== Update Status ===============================================

const statusChange = async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    const statusData = req.body.orderStatus;
    if (statusData == "Delivered") {
      const orderData = await orderModel
        .updateOne(
          { _id: orderId },
          { $set: { orderStatus: statusData, paymentStatus: "Paid" } }
        )
        .then((data) => {
          res.send({ success: true });
        });
    } else if (statusData == "Returned") {
      const reOrderStock = await orderModel.findOne({ _id: orderId });
      reOrderStock.products.forEach(async (items, i) => {
        let orderQty = items.quantity;
        let orderProduct = await productModel.updateOne(
          { _id: items.product },
          { $inc: { stock: orderQty } }
        );
      });
      const userData = await orderModel.findOne({ _id: orderId });
      const cusId = userData.user_Id;
      const user = await userModel.findOne({ _id: cusId });
      let walletData = await userModel.updateOne(
        { _id: cusId },
        { $inc: { wallet: userData.Subtotal } }
      );
      const orderData = await orderModel
        .updateOne(
          { _id: orderId },
          { $set: { orderStatus: statusData, paymentStatus: "Refunded" } }
        )
        .then((data) => {
          res.send({ success: true });
        });
    } else {
      const orderData = await orderModel
        .updateOne({ _id: orderId }, { $set: { orderStatus: statusData } })
        .then((data) => {
          res.send({ success: true });
        });
    }
  } catch (error) {
    next(error);
  }
};

//! =============================================== Reject Status ===============================================

const rejectStatus = async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    const statusData = req.body.orderStatus;
    if (statusData == "Rejected") {
      const orderCheck = await orderModel.findOne({ _id: orderId });
      if (orderCheck.paymentStatus == "Paid") {
        const userData = await orderModel.findOne({ _id: orderId });
        const cusId = userData.user_Id;
        const user = await userModel.findOne({ _id: cusId });
        let walletData = await userModel.updateOne(
          { _id: cusId },
          { $inc: { wallet: userData.Subtotal } }
        );
        const reOrderStock = await orderModel.findOne({ _id: orderId });
        reOrderStock.products.forEach(async (items, i) => {
          let orderQty = items.quantity;
          let orderProduct = await productModel.updateOne(
            { _id: items.product },
            { $inc: { stock: orderQty } }
          );
        });
        const orderData = await orderModel
          .updateOne(
            { _id: orderId },
            { $set: { orderStatus: statusData, paymentStatus: "Refunded" } }
          )
          .then((data) => {
            res.send({ success: true });
          });
      } else {
        const reOrderStock = await orderModel.findOne({ _id: orderId });
        reOrderStock.products.forEach(async (items, i) => {
          let orderQty = items.quantity;
          let orderProduct = await productModel.updateOne(
            { _id: items.product },
            { $inc: { stock: orderQty } }
          );
        });
        const orderData = await orderModel
          .updateOne({ _id: orderId }, { $set: { orderStatus: statusData } })
          .then((data) => {
            res.send({ success: true });
          });
      }
    } else {
      const orderData = await orderModel
        .updateOne({ _id: orderId }, { $set: { orderStatus: statusData } })
        .then((data) => {
          res.send({ success: true });
        });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewOrderManage,
  viewOrderData,
  statusChange,
  rejectStatus,
};
