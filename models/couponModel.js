const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "user",
  },
  couponCode: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  minimumAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Active",
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

module.exports = couponModel = mongoose.model("coupon", couponSchema);
