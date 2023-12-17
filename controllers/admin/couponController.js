const couponModel = require("../../models/couponModel");

//! =============================================== Coupon List ===============================================

const viewCoupon = async (req, res, next) => {
  try {
    const id = req.body.id;
    const coupon = await couponModel.find();
    const couponCount = await couponModel.count();
    const singleCoupon = await couponModel.find({ _id: id });
    res.render("admin/couponManage", {
      page: "coupon",
      admin: res.locals.admindata.name,
      coupon,
      couponCount,
      singleCoupon,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================ Upload Coupon ============================================

const createCoupon = async (req, res, next) => {
  try {
    const check = await couponModel.findOne();
    let coupon = couponModel({
      couponCode: req.body.couponCode,
      discountAmount: req.body.discount,
      minimumAmount: req.body.minimum,
      expiryDate: req.body.expire,
    });
    coupon.save().then(() => {
      res.redirect("/coupon");
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================ Delete Coupon ============================================

const deleteCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    couponModel.deleteOne({ _id: id }).then(() => {
      res.redirect("/coupon");
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewCoupon,
  createCoupon,
  deleteCoupon,
};
