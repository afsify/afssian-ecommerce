const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "unbanned",
  },
  address: [
    {
      name: { type: String },
      house: { type: String },
      post: { type: String },
      city: { type: String },
      district: { type: String },
      state: { type: String },
      pin: { type: Number },
    },
  ],
  cart: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  wishlist: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
    },
  ],
  wallet: {
    type: Number,
    default: 0,
  },
});

module.exports = userModel = mongoose.model("user", userSchema);
