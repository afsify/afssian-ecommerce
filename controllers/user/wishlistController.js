const userModel = require("../../models/userModel");

//! ============================================== User Wishlist ==============================================

const viewWishlist = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    let cart = await userModel
      .findOne({ _id: userId })
      .populate("cart.product_id");
    const id = res.locals.userdata;
    let userData = await userModel.findOne({ _id: id });
    let wishlist = await userModel
      .findOne({ _id: id })
      .populate("wishlist.product_id");
    res.render("user/userWishlist", {
      page: "wishlist",
      cart,
      userData,
      wishlist,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================= Add to Wishlist =============================================

const addToWishlist = async (req, res, next) => {
  try {
    const id = res.locals.userdata._id;
    const productId = req.params.id;
    let isExist = await userModel.findOne({ _id: id });
    let wishlistIndex = isExist.wishlist.findIndex(
      (productId) => productId.product_id == req.params.id
    );
    if (wishlistIndex == -1) {
      await userModel.updateOne(
        { _id: id },
        { $push: { wishlist: { product_id: productId } } }
      );
      res.send({ added: true });
    } else {
      await userModel.updateOne(
        { _id: id },
        { $pull: { wishlist: { product_id: productId } } }
      );
      res.send({ exists: true });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================= Delete Wishlist =============================================

const deleteWishlist = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    const wishId = req.body.id;
    await userModel.updateOne(
      { _id: id._id },
      { $pull: { wishlist: { _id: wishId } } }
    );
    let wishlist = await userModel
      .findOne({ _id: id })
      .populate("wishlist.product_id");
    if (wishlist.wishlist.length == 0) {
      res.json("remove");
    } else {
      res.json("added");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewWishlist,
  addToWishlist,
  deleteWishlist,
};
