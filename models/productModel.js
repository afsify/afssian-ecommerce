const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
    index: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "In Stock",
  },
  image: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = productModel = mongoose.model("product", productSchema);
