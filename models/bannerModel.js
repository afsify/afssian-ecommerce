const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  bannerName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: Boolean,
    default: "false",
  },
  image: {
    type: String,
    required: true,
  },
});

module.exports = bannerModel = mongoose.model("banner", bannerSchema);
