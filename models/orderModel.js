const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_Id: {
      type: String,
      ref: "user",
      required: true,
    },
    address: {
      name: { type: String },
      phone: { type: Number },
      house: { type: String },
      post: { type: String },
      city: { type: String },
      district: { type: String },
      state: { type: String },
      pin: { type: Number },
    },
    products: [
      {
        product: {
          type: String,
          ref: "product",
        },

        quantity: {
          type: String,
          default: 1,
        },

        price: {
          type: Number,
          default: 0,
        },
      },
    ],
    Subtotal: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    orderStatus: {
      type: String,
    },
    coupon: {
      couponCode: { type: String, default: "" },
      couponDiscount: { type: Number, default: 0 },
    },
    returnReason: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = orderModel = mongoose.model("order", orderSchema);
