const bcrypt = require("bcrypt");
const userModel = require("../../models/userModel");
const couponModel = require("../../models/couponModel");
const categoryModel = require("../../models/categoryModel");

//! ============================================== User Profile ==============================================

const viewAccount = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    let category = await categoryModel.find();
    let userdetials = await userModel.findOne({ _id: id });
    let cart = await userModel.findOne({ _id: id }).populate("cart.product_id");
    res.render("user/userProfile", {
      page: "account",
      cart,
      category,
      userdetials,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Update Profile ==============================================

const updateProfile = async (req, res, next) => {
  try {
    const name = req.body.name;
    const phone = req.body.phone;
    await userModel
      .updateOne(
        { _id: res.locals.userdata._id },
        { $set: { name: name, phone: phone } }
      )
      .then(() => {
        res.redirect("/account");
      });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Change Password ==============================================

const viewChangePassword = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    const userData = await userModel.findOne({ _id: id });
    let cart = await userModel.findOne({ _id: id }).populate("cart.product_id");
    res.render("user/changePassword", {
      page: "changePassword",
      userData,
      cart,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================= Update Password =============================================

const updatePassword = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: res.locals.userdata._id });
    const isPass = await bcrypt.compare(req.body.password, user.password);
    if (isPass) {
      if (req.body.newPassword && req.body.newPassword.length >= 8) {
        let newPass = await bcrypt.hash(req.body.newPassword, 10);
        await userModel.updateOne(
          { _id: res.locals.userdata._id },
          { $set: { password: newPass } }
        );
        res.send({ updated: true });
      } else {
        res.send({ notSecured: true });
      }
    } else {
      res.send({ notMatch: true });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================== Address List ==============================================

const viewAddress = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    let cart = await userModel
      .findOne({ _id: userId })
      .populate("cart.product_id");
    const id = res.locals.userdata;
    let category = await categoryModel.find();
    let userdetials = await userModel.findOne({ _id: id });
    res.render("user/userAddress", {
      page: "address",
      cart,
      category,
      userdetials,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Add Address ==============================================

const createAddress = async (req, res, next) => {
  try {
    const id = res.locals.userdata._id;
    let isExist = await userModel.findOne({ _id: id });
    let newAddress = {
      name: req.body.Name,
      house: req.body.House,
      post: req.body.post,
      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      pin: req.body.pin,
    };
    await userModel
      .updateOne({ _id: id }, { $push: { address: newAddress } })
      .then(() => {
        res.redirect("/address");
      });
  } catch (error) {
    next(error);
  }
};

//! ============================================ Delete Address ============================================

const deleteAddress = async (req, res, next) => {
  try {
    const id = req.params.id;
    await userModel.findOne({ _id: id });
    await userModel
      .updateOne(
        { _id: res.locals.userdata._id },
        { $pull: { address: { _id: id } } }
      )
      .then(() => {
        res.redirect("/address");
      });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Coupon Discount ==============================================

const viewDiscount = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const couponCheck = await orderModel.find({ user_Id: userId });
    const usedCoupon = couponCheck.map((order) => order.coupon.couponCode);
    let cart = await userModel
      .findOne({ _id: userId })
      .populate("cart.product_id");
    const id = res.locals.userdata;
    let coupon = await couponModel.find();
    const couponCount = await couponModel.count();
    let userDetail = await userModel.findOne({ _id: id });
    res.render("user/userCoupon", {
      page: "discount",
      cart,
      coupon,
      couponCount,
      usedCoupon,
      userDetail,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewAccount,
  updateProfile,
  viewChangePassword,
  updatePassword,
  viewAddress,
  createAddress,
  deleteAddress,
  viewDiscount,
};
